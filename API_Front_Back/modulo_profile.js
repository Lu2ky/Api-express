import express from "express";
import { Connection } from "../Connection.js";

let Con = new Connection();
const router = express.Router();

//	Sacar la info del usuario
router.get("/api/get-user-data/:idUser", async (req, res) => {
	const ID_USER = req.params.idUser;

	const TOKEN = req.header('Authorization');
	const CALL = `/users/${ID_USER}`;

	try {

		const TOKEN_RESPONSE = await Con.goGetFetcher(`/auth/token`, TOKEN);

		if (!TOKEN_RESPONSE.status){
			throw new error("No existen los permisos necesarios");
		}

		//const RESULT = await Con.getUserData(ID_USER);
		const RESULT = await Con.goGetFetcher(CALL)

		return res.status(200).json({
			success: RESULT != undefined,
			data: RESULT
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

// Configurar la información del usuario
router.post('/api/config-notification', async (req, res) =>{
	const ID = req.body.idUsuario;
	const MAIL = req.body.correo;
	const TIME_MUTE = req.body.antelacionNotis;

	
	const TOKEN = req.header('Authorization');
	const CALL = `/notifications/mute`;
	const DATA = {
		idUsuario: ID,
		correo: MAIL,
		antelacionNotis: TIME_MUTE
	}

	try {
		const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);
/*
		const RESULT = await Con.configNotifications(
			ID,
			MAIL,
			TIME_MUTE,
			CELLPHONE
		);
*/
		return res.status(200).json({
			success: (RESULT != undefined),
			data: RESULT
		});

	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}

});

// --------------------------------------- GUARDAR PALETA ------------------------------------

router.post('/api/save-palette', async (req, res) => {
	const USER_ID = req.body.userId.toString();
	const PALETTE = req.body.palette;

	const TOKEN = req.header('Authorization');
	const CALL = `/palette`;
	const DATA = {
		userId: USER_ID,
		palette: PALETTE
		}

	try {

		// Llamar método de guardar de la api de go
		const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);
		return res.status(200).json({
			success: (RESULT != undefined),
			data: RESULT
		});

	} catch (error) {
		console.error("Error en send-code:", error.message);
		return res.status(500).json({ error: "Error interno del servidor" });
	}
});

// Obtener paleta de colores por id
router.post('/api/get-palette', async (req, res) =>{
	const USER_ID = req.body.userId.toString();

	const CALL = `/palette/get`;
	const DATA = {
		userId: `palette:${USER_ID}`,
	};
	
	try {
		const RESPONSE = await Con.goPostFetcher(CALL, DATA); 
		const palette = RESPONSE.palette;

		return res.status(200).json({ 
			palette: palette
		});

	} catch (error) {
		console.error("Hubo un fallo en el proceso:", error.message);
		return res.status(500).json({ 
			success: false, 
			error: "Error interno del servidor" 
		});
	}

});

export default router;