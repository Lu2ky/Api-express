import dotenv from "dotenv";
import Redis from "ioredis";
import jwt from "jsonwebtoken";

dotenv.config();	//PROD
//dotenv.config({path: resolve(__dirname, "../../config/expressapiconfig.env")});	//LOCAL

const API_ADDR = process.env.API_ADDR
const API_PORT = process.env.API_PORT
const REDIS_HOST = process.env.DB_ADDR_REDIS;
const REDIS_PORT = Number(process.env.DB_ADDR_PORT_REDIS || 6379);
const REDIS_PASSWORD = process.env.DB_PASS_REDIS || "";
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 172800);
const JWT_SECRET = process.env.JWT_SECRET || "";

const redis = new Redis({
	host: REDIS_HOST,
	port: REDIS_PORT,
	password: REDIS_PASSWORD,
	maxRetriesPerRequest: 1,
	enableReadyCheck: false,
	lazyConnect: true,
});

// Para que ejecute una instancia local de la API de Go
//const API_ADDR = "localhost";
//const API_PORT = "8080";

export class Connection {
	constructor() {}

	async ensureRedisConnection() {
		if (redis.status === "ready" || redis.status === "connect") {
			return;
		}

		try {
			await redis.connect();
		} catch {
			// If connection is already active/in-progress, continue.
		}
	}

	cleanToken(token = null) {
		const safeToken = String(token || "").trim();
		if (!safeToken) {
			return "";
		}

		return safeToken.startsWith("Bearer ") ? safeToken.slice(7).trim() : safeToken;
	}

	getTokenUser(token = null) {
		const clean = this.cleanToken(token);
		if (!clean) return null;

		try {
			if (JWT_SECRET) {
				const verified = jwt.verify(clean, JWT_SECRET);
				return verified?.sub ? String(verified.sub) : null;
			}

			const decoded = jwt.decode(clean);
			return decoded?.sub ? String(decoded.sub) : null;
		} catch {
			return null;
		}
	}

	extractUserFromService(service) {
		const match = String(service || "").match(/\/users\/([^/]+)/);
		return match?.[1] ? String(match[1]) : null;
	}

	getCacheUser(service, token = null) {
		const routeUser = this.extractUserFromService(service);
		const tokenUser = this.getTokenUser(token);

		if (routeUser && tokenUser && routeUser !== tokenUser) {
			return null;
		}

		if (routeUser) {
			return routeUser;
		}

		if (tokenUser) {
			return tokenUser;
		}

		return null;
	}

	buildCacheKey(service, token = null) {
		const user = this.getCacheUser(service, token);
		if (!user) return null;

		const normalizedService = String(service || "")
			.replace(/^\/+/, "")
			.replace(/[^a-zA-Z0-9:/_-]/g, "_");

		return `api-express:go-cache:user:${user}:get:${normalizedService}`;
	}

	async getFromCache(cacheKey) {
		if (!cacheKey) return null;

		await this.ensureRedisConnection();

		try {
			const val = await redis.get(cacheKey);
			if (!val) return null;

			return JSON.parse(val);
		} catch {
			return null;
		}
	}

	async setInCache(cacheKey, value) {
		if (!cacheKey || value == null) return;

		await this.ensureRedisConnection();

		try {
			await redis.set(cacheKey, JSON.stringify(value), "EX", CACHE_TTL_SECONDS);
		} catch {
			// Cache errors should never block API flow.
		}
	}

	getUserForInvalidation(bodyData = {}, token = null) {
		const tokenUser = this.getTokenUser(token);
		if (tokenUser) {
			return tokenUser;
		}

		const candidate =
			bodyData?.codUsuario ??
			bodyData?.P_codigo_usuario ??
			bodyData?.P_codUsuario ??
			bodyData?.userId ??
			bodyData?.User ??
			null;

		return candidate ? String(candidate) : null;
	}

	async invalidateUserCache(user) {
		if (!user) return;

		await this.ensureRedisConnection();

		const prefix = `api-express:go-cache:user:${user}:get:`;
		let cursor = "0";

		try {
			do {
				const [nextCursor, keys] = await redis.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
				cursor = nextCursor;

				if (keys.length > 0) {
					await redis.del(...keys);
				}
			} while (cursor !== "0");
		} catch {
			// Invalidation errors should not block mutations.
		}
	}

	//	--- Fetcher --- //
	async goGetFetcher(service, token = null) {

		const URL = `http://${API_ADDR}:${API_PORT}/api/v1${service}`

		try {
			const cacheKey = this.buildCacheKey(service, token);
			if (cacheKey) {
				const cachedResponse = await this.getFromCache(cacheKey);
				if (cachedResponse !== null) {
					return cachedResponse;
				}
			}

			const headers = {
				"X-API-Key": process.env.API_KEY
			};

			const safeToken = String(token || "").trim();
			if (safeToken) {
				headers["Authorization"] = safeToken;
			}

			const rta = await fetch(URL, {
				method: "GET",
				headers
			});

			if (!rta.ok) {
				const detail = await rta.text();
				throw new Error(`Error: ${rta.status}, ${detail}`);
			}
			const RESPONSE = await rta.json();

			if (cacheKey) {
				await this.setInCache(cacheKey, RESPONSE);
			}

			return RESPONSE;
		} catch (error) {

			console.error("ERROR EN LA CONEXION:", error);
			return null;
		}
	}

	async goPostFetcher(service, bodyData, token = null) {
		
		const URL = `http://${API_ADDR}:${API_PORT}/api/v1${service}`

		try {
			const headers = {
				"Content-Type": "application/json",
				"X-API-Key": process.env.API_KEY
			};

			const safeToken = String(token || "").trim();
			if (safeToken) {
				headers["Authorization"] = safeToken;
			}

			const rta = await fetch(URL, {
				method: "POST",
				headers,
				body: JSON.stringify(bodyData)
			});

			if (!rta.ok) {
				const detail = await rta.text();
				throw new Error(`Error: ${rta.status}, ${detail}`);
			}

			const RESPONSE = await rta.json();

			const userForInvalidation = this.getUserForInvalidation(bodyData, token);
			if (userForInvalidation) {
				await this.invalidateUserCache(userForInvalidation);
			}

			return RESPONSE;

		} catch (error) {

			console.error("ERROR EN LA CONEXION:", error);
			return null;
		}
	}
}