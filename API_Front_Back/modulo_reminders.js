import express from "express";
import { Reminder } from "../Reminder.js";
import { Connection } from "../Connection.js";
import { scheduleEmailAndNotification } from './funciones_notifications.js'

let Con = new Connection();
const router = express.Router();

//  -------------------------- ETIQUETAS DE RECORDATORIOS ----------------------- \\

// Obtener etiquetas por id usuario
router.get("/api/tags-by-user/:userId", async (req, res) => {
	try {
        const USER_ID = req.params.userId;
        const TOKEN = req.header('Authorization');
        const CALL = `/tags/users/${USER_ID}`;

		const data = await Con.goGetFetcher(CALL, TOKEN)//await Con.GetTagsByUserId(req.params.userId);

		const tags = data == null ? null : data
			.map(eachData => {
				return eachData.B_isDeleted.Bool ? null :{
					id: eachData.N_idEtiqueta,
					nombre: eachData.T_nombre
				}
			})
			.filter(tag => tag !== null);

		return res.status(200).json({success: true, data: tags});
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({success: false, error: error.message});
	}
});

//	Obtener etiquetas por usuario y recordatorio [POSIBLEMENTE EN DESUSO]
router.get("/api/tags-by-user-and-reminder/:userId/:reminderId", async (req, res) => {
	try {

        const USER_ID = req.params.userId;
        const REMINDER_ID = req.params.reminderId

        const TOKEN = req.header('Authorization');
        const CALL = `/tags/users/${USER_ID}/reminders/${REMINDER_ID}`;

		const RESPONSE = await Con.goGetFetcher(CALL, TOKEN);
/*
		const data = await Con.GetTagsByUserAndCourse(
			req.params.userId,
			req.params.reminderId
		);
*/
		const tags = RESPONSE == null ? null : RESPONSE.map(eachData => {

            return eachData.B_isDeleted.Bool ? null : {
                id: eachData.N_idEtiqueta,
                nombre: eachData.T_nombre
            }

        }).filter(tag => tag !== null);

		return res.status(200).json({success: true, data: tags});
	} catch (error) {

		console.error("Error:", error);
		return res.status(500).json({success: false, error: error.message, data: null});
	}
});

// Eliminar etiqueta
router.post("/api/delete-tag", async (req, res) => {
	try {
		const TAG_ID = req.body.idTag;
		const USER_ID = req.body.idUsuario;
		const USER_CODE = req.body.codUsuario;

        if (!TAG_ID) {
			return res.status(400).json({success: false, error: "IdTag requerido"});
		}

        const TOKEN = req.header('Authorization');
        const SERVICE = `/tags/delete`;
        const BODY = {
            N_idEtiqueta: TAG_ID,
			P_usuario: USER_ID,
			codUsuario: USER_CODE

        }
		
        const RESPONSE = await Con.goPostFetcher(SERVICE, BODY, TOKEN);
		//const result = await Con.DeleteTag(IdTag);

		return res.status(200).json({success: true, data: RESPONSE});
	} catch (error) {
        
		console.error("Error:", error);
		return res.status(500).json({success: false, error: error.message});
	}
});

//  -------------------------- RECORDATORIOS ----------------------- \\

router.get("/api/reminders-tags-by-user/:userId", async (req, res) => {

	//Esta madre es para intentar asegurar que ambas consultas lleguen y no se pierdan por timeOuts o cosas por el estilo
	async function goGetWithRetry(url, token, retries = 3, backoff = 100) {
		try {
			const RESPONSE = await Con.goGetFetcher(url, token);

			return RESPONSE
		} catch (err) {
			if (retries > 0) {
				console.warn(`Falló la petición. Reintentando en ${backoff}ms... (Quedan ${retries})`);
				
				await new Promise(resolve => setTimeout(resolve, backoff));
				
				return goGetWithRetry(url, token, retries - 1, backoff * 2);
			} else {

				throw new Error("Se agotaron los reintentos: " + err.message);
			}
		}
	}

	const USER_ID = req.params.userId;
	const TOKEN = req.header('Authorization');
    const CALL_TAGS = `/tags/users/${USER_ID}`;
	const CALL_REMINDERS= `/reminders/users/${USER_ID}`;

	const RESPONSE_TAGS = await goGetWithRetry(CALL_TAGS, TOKEN);
	const RESPONSE_REMINDERS = await goGetWithRetry(CALL_REMINDERS, TOKEN);

	const REMINDERS = RESPONSE_REMINDERS.filter(a => a.B_isDeleted == false);

	//Procesar Tags
	RESPONSE_TAGS.forEach(TAG => {
		
		if (TAG.B_isDeleted.Bool) return;

		const REM_ID = TAG.N_idRecordatorio;
		const REM = REMINDERS.find(R => R.N_idRecordatorio == REM_ID);

		if (!REM) return;

		if (REM.tags == undefined) REM.tags = [];
		REM.tags.push({
			tag_id: TAG.N_idEtiqueta,
			tag_nombre: TAG.T_nombre
		})

	});
	
	console.log(REMINDERS);

	return res.json(REMINDERS);

	/*
	//let data = await Con.getRemindersTags(req.params.userId);
	const USER_ID = req.params.userId;
	const TOKEN = req.header('Authorization');
    const CALL = `/reminders/users/${USER_ID}/tags`;

	let todo_id = -1;
	let reminder_pos = -1;
	let reminders = [];

	let data = await Con.goGetFetcher(CALL, TOKEN);

	data.forEach(eachData => {
		//console.log(eachData.B_isDeleted);
		//console.log(eachData)

		if (eachData.B_isDeleted == true) {
			return;
		}

		//DETECTA UN CAMBIO
		if (todo_id != eachData.N_idToDoList){
			todo_id = eachData.N_idToDoList


			let reminder = new Reminder(
				eachData.N_idToDoList,
				eachData.N_idUsuario,
				eachData.N_idRecordatorio,
				eachData.T_nombre,
				eachData.T_descripcion,
				eachData.Dt_fechaVencimiento,
				eachData.B_isDeleted,
				eachData.T_Prioridad,
				eachData.B_estado

			).getData();

			reminder.tags = [];

			reminders.push(reminder);

			reminder_pos++;
		}

		//AÑADE EL NOMBRE DE LA TAG AL ACTUAL
		if (reminders.length > 0 && eachData.B_tag_isDeleted == false){

			reminders[reminder_pos].tags.push({
				tag_nombre: eachData.T_tag_nombre,
				tag_id: eachData.N_idEtiqueta
			})
		}
	});

	return res.json(reminders);
	*/
});

// Añadir recordatorio
router.post("/api/add-reminder", async (req, res) => {
    const USER_ID = req.body.P_usuario;
    const TASK_NAME = req.body.P_nombre;
    const DESC = req.body.P_descripcion;
    const DATE = req.body.P_fecha;
	const PRIORITY = req.body.P_prioridad;
	const TAG1 = req.body.P_tag1;
	const TAG2 = req.body.P_tag2;
	const TAG3 = req.body.P_tag3;
	const TAG4 = req.body.P_tag4;
	const TAG5 = req.body.P_tag5;

	const USER_CODE = req.body.P_codigo_usuario;

	const TOKEN = req.header('Authorization');
    const CALL = `/reminders`;
	const DATA = {
		P_usuario: USER_ID,
		P_nombre: TASK_NAME,
		P_descripcion: DESC,
		P_fecha: DATE,
		P_prioridad: PRIORITY,
		P_tag1: TAG1,
		P_tag2: TAG2,
		P_tag3: TAG3,
		P_tag4: TAG4,
		P_tag5: TAG5,
		codUsuario: USER_CODE
	}

    try {
		const CALL_USERDATA = `/users/${USER_CODE}`;

		const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);
		const RESULT_USERDATA = await Con.goGetFetcher(CALL_USERDATA, TOKEN);

		
/*	
        const RESULT = await Con.addReminder(
			USER_ID, 
			TASK_NAME, 
			DESC, 
			DATE, 
			PRIORITY,
			TAG1,
			TAG2,
			TAG3,
			TAG4,
			TAG5
		);
/*	
		const url = `http://${process.env.API_ADDR}:${process.env.API_PORT}/api/v1/users/${USER_CODE}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 
				'Content-Type': 'application/json',
				"X-API-Key": process.env.API_KEY
			}
        });
*/	
		console.log("RESULTAOS -----------------------")
		console.log(RESULT);
		console.log(RESULT_USERDATA);
        //const jsonResponse = await RESULT_USERDATA.json();
        const USER_DATA = RESULT_USERDATA[0];

		const ID_TO_DO = RESULT.InsertedId;
		const USER_NAME = USER_DATA.nombre;
		const ADVANCE_NOTICE = USER_DATA.antelacionNotis;
		const CLIENT_EMAIL = USER_DATA.correo;

        if (RESULT) {
            scheduleEmailAndNotification(
                ID_TO_DO,    
                USER_NAME, 
                TASK_NAME, 
                DESC,      
                DATE,      
                ADVANCE_NOTICE,   
                CLIENT_EMAIL,
				USER_CODE
            );
        }

        return res.status(200).json({ success: true, data: RESULT });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error interno" });
    }
});

// Actualizar etiquetas de recordatorio
router.post('/api/update-reminder', async (req, res) =>{
	const TODO_ID = req.body.P_idToDo;
	const NEW_NAME = req.body.P_nombre;
	const NEW_DESC = req.body.P_descripcion;
	const NEW_PRIORITY = req.body.P_prioridad;
	const NEW_STATE = req.body.P_estado;
	const NEW_DATE = req.body.P_fecha;
	const NEW_TAG1 = req.body.P_tag1;
	const NEW_TAG2 = req.body.P_tag2;
	const NEW_TAG3 = req.body.P_tag3;
	const NEW_TAG4 = req.body.P_tag4;
	const NEW_TAG5 = req.body.P_tag5;
	const USER_CODE = req.body.codUsuario;

	const TOKEN = req.header('Authorization');
	const CALL = `/reminders/update`;

	const DATA = {
		P_idToDo: TODO_ID,
		P_nombre: NEW_NAME,
		P_descripcion: NEW_DESC,
		P_fecha: NEW_DATE,
		P_prioridad: NEW_PRIORITY,
		P_estado: NEW_STATE,
		P_tag1: NEW_TAG1,
		P_tag2: NEW_TAG2,
		P_tag3: NEW_TAG3,
		P_tag4: NEW_TAG4,
		P_tag5: NEW_TAG5,
		codUsuario: USER_CODE,
	}

	try {

		const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);
		const success = RESULT != undefined;

		return res.status(200).json({
			success: success
		});
	} catch (error) {
		console.error(error);

		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}

});

// Eliminar recordatorio
router.post("/api/remove-reminder", async (req, res) => {
	const REMINDER_ID = req.body.N_idRecordatorio;
	const USER_ID = req.body.idUsuario;
	const USER_CODE = req.body.codUsuario;

	const TOKEN = req.header('Authorization');
    const CALL = `/reminders/delete-or-recover`;

	const DATA = {
		N_idRecordatorio: REMINDER_ID,
		P_usuario: USER_ID,
		codUsuario: USER_CODE
	}

	try {
		//const RESULT = await Con.deleteReminder(ID);
		const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);

		const success = RESULT != undefined;

		return res.status(200).json({
			success: success
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

// Eliminar recordatorio
router.post("/api/remove-multiple-reminders", async (req, res) => {
	const ARRAY_REMINDERS_ID = req.body.idRecordatorios;
	const USER_ID = req.body.idUsuario;
	const USER_CODE = req.body.codUsuario;

	const REMINDERS_ID = ARRAY_REMINDERS_ID.toString();
	const TOKEN = req.header('Authorization');
    const CALL = `/reminders/delete/multiple`;

	const DATA = {
		N_idRecordatorios: REMINDERS_ID,
		P_usuario: USER_ID,
		codUsuario: USER_CODE,
	}

	try {
		//const RESULT = await Con.deleteReminder(ID);
		const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);

		return res.status(200).json({
			success: RESULT != undefined
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

export default router;