import dotenv from "dotenv";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import bcrypt from "bcrypt";

dotenv.config();	//PROD
//dotenv.config({path: resolve(__dirname, "../../config/expressapiconfig.env")});	//LOCAL

const API_ADDR = process.env.API_ADDR
const API_PORT = process.env.API_PORT

// Para que ejecute una instancia local de la API de Go
//const API_ADDR = "localhost";
//const API_PORT = "8080";

export class Connection {
	constructor() {}

	//	--- Fetcher --- //
	async goGetFetcher(service, token = null) {

		const URL = `http://${API_ADDR}:${API_PORT}/api/v1${service}`
		console.log(API_ADDR);
		console.log(API_PORT);
		console.log(service);
		console.log(URL);

		try {
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
			console.log(RESPONSE);

			return RESPONSE;
		} catch (error) {

			console.error("ERROR EN LA CONEXION:", error);
			return null;
		}
	}

	async goPostFetcher(service, bodyData, token = null) {
		
		const URL = `http://${API_ADDR}:${API_PORT}/api/v1${service}`
		console.log(URL)
		console.log(bodyData)

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
			return RESPONSE;

		} catch (error) {

			console.error("ERROR EN LA CONEXION:", error);
			return null;
		}
	}
}