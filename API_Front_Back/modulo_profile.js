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
		//const RESULT = await Con.getUserData(ID_USER);
		const RESULT = await Con.goGetFetcher(CALL, TOKEN)

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
	const CELLPHONE = req.body.telefono;

	
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

export default router;