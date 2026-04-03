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

		const URL = `http://${API_ADDR}:${API_PORT}/api/v1${service}`//"http://" + API_ADDR + ":" + API_PORT + service;
		console.log(API_ADDR);
		console.log(API_PORT);
		console.log(service);
		console.log(URL);

		try {
			const rta = await fetch(URL, {
				method: "GET",
				headers: {
					"Authorization": token,
					"X-API-Key": process.env.API_KEY
				}
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}, ${rta.text()}`);
			const RESPONSE = await rta.json();
			console.log(RESPONSE);

			return RESPONSE;
		} catch (error) {

			console.error("ERROR EN LA CONEXION:", error);
		}
	}

	async goPostFetcher(service, bodyData, token = null) {
		
		const URL = `http://${API_ADDR}:${API_PORT}/api/v1${service}`
		console.log(URL)
		console.log(bodyData)

		try {
			const rta = await fetch(URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": token,
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(bodyData)
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}, ${rta.text()}`);

			const RESPONSE = await rta.json();
			return RESPONSE;

		} catch (error) {

			console.error("ERROR EN LA CONEXION:", error);
		}
	}
}