import { Connection } from "../Connection.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import { officialAct } from "../OfficialAct.js";
import { PersonalAct } from "../PersonalAct.js";
import { Notification } from "../Notification.js";
import express from "express";
import cors from "cors";
import { stringify } from "querystring";
import { Reminder } from "../Reminder.js";
import { promises } from "dns";
import schedule from 'node-schedule';
import e from "express";
import { Queue } from 'bullmq';
import { redisConnection } from '../QueueConfig.js'; 
import '../ReminderWorker.js';
import {} from 'express';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//INTERCAMBIAR ESTAS DOS LINEAS SI SE QUIERE EJECUTAR EN LOCAL O SI SE SUBIRÁ A PRODUCCION

dotenv.config(); //PROD
//dotenv.config({path: resolve(__dirname, "../../../config/expressapiconfig.env")});	//LOCAL

const app = express();
const PORT = 28523;
app.use(cors());
app.use(express.json());

let Con = new Connection();

const reminderQueue = new Queue('reminderQueue', { connection: redisConnection });

reminderQueue.client.then(async (client) => {
    try {
        // Al tener password, este 'ping' debería devolver 'PONG'
        const respuesta = await client.ping();
        console.log("--- RESULTADO DE AUTENTICACIÓN ---");
        if (respuesta === 'PONG') {
            console.log("¡CONTRASEÑA CORRECTA! Conexión total establecida.");
            
            // Opcional: Probar escritura
            await client.set('auth_test', 'Exito');
            console.log("Escritura permitida.");
        }
    } catch (error) {
        console.error("ERROR DE AUTENTICACIÓN:", error.message);
        console.log("Tip: Revisa que DB_PASSWORD_REDIS en tu .env sea la correcta.");
    }
});

//	--------------------------------------- ACTIVIDADES -------------------------------------- \\

// Obtener horario oficial
app.get("/api/official-schedule/:userId", async (req, res) => {
	//	req.params permite obtener los valoeres dados por medio de la URL
	const USER_ID = req.params.userId;

	try {
		//Petición a la API de Go
		let data = await Con.GetOfficialScheduleByUserId(USER_ID);

		//Procesamiento de los datos.
		const ACTIVITIES = data.map(eachData => {
			console.log(eachData);
			let OfficialActivity = new officialAct(
				eachData.N_idHorario,
				eachData.N_idcourse,
				eachData.Course,
				eachData.Teacher,
				eachData.Classroom,
				eachData.Nrc,
				[eachData.StartHour, eachData.EndHour, eachData.Day],
				eachData.Tag,
				eachData.Campus,
				eachData.Credits,
				eachData.FechaInicio,
				eachData.FechaFinal,
				eachData.IdPeriodoAcademico,
				eachData.PeriodoAcademico
			);

			return OfficialActivity.getData();
		});

		res.status(200).json(ACTIVITIES);
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			success: false,
			message: "Error al obtener el horario",
			error: error.message
		});
	}
});

// Obtener horario personal
app.get("/api/personal-schedule/:userId", async (req, res) => {
	let data = await Con.GetPersonalScheduleByUserId(req.params.userId);

	let PersonalActivitys = data
		.map(eachData => {
			if (eachData.IsDeleted.Bool == true) {
				return null;
			}

			let PersonalActivity = new PersonalAct(
				eachData.N_idcourse,
				eachData.Activity,
				eachData.Description.Valid ? eachData.Description.String : null,
				[eachData.StartHour, eachData.EndHour, eachData.Day],
				eachData.Tag,
				eachData.Dt_Start.String,
				eachData.Dt_End.String
			);

			return PersonalActivity.getData();
		})
		.filter(activity => activity !== null);

	return res.json(PersonalActivitys);
});

// Editar descripción de actividad personal
app.post("/api/add-personal-activity", async (req, res) => {
	/*
    data = {
		id_user
		
		subject_name
		description

		date_start
		date_end

		hour_start
		hour_end
		day

		id_academic_per

		times: [ACTIVITY TIMES]

		TIMES es un arreglo que contiene la información del tiempo de todas
		las actividades de un día concreto y tiene la siguiente estructura

		times: [
			[ACT_ID, START_HOUR, END_HOUR, START_DATE, END_DATE],
			...,
			[ACT_ID, START_HOUR, END_HOUR, START_DATE, END_DATE]
		]
    }
  */
	const ID_USER = req.body.id_user;

	const ID_ACADEMIC_PER = req.body.id_academic_per;
	const NAME = req.body.subject_name;
	const DESC = req.body.description;

	const STA_DATE = req.body.date_start;
	const END_DATE = req.body.date_end;

	const STA_HOUR = req.body.start_hour;
	const END_HOUR = req.body.end_hour;
	const DAY = req.body.day;

	let TIMES = await Con.GetTimesData(ID_USER, DAY)
	
	if (TIMES !== null){
		TIMES = TIMES.map(element =>{

			return element.IsDeleted ? null : [element.idcourse, element.StartHour, element.EndHour, element.FechaInicio, element.FechaFinal]
		}).filter(e => e !== null);
	}

	try {
		if (
			PersonalAct.hasCollisions(
				TIMES,
				-1,
				STA_HOUR,
				END_HOUR,
				STA_DATE,
				END_DATE
			)
		) {
			return res.status(400).json({
				error: "Colisión de horarios"
			});
		}

		const RESULT = await Con.addPersonalActivity(
			ID_USER,
			NAME,
			DESC,
			STA_DATE,
			END_DATE,
			DAY,
			STA_HOUR,
			END_HOUR,
			ID_ACADEMIC_PER
		);

		return res.status(200).json({
			success: true,
			data: RESULT
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

//	Actualizar actividad personal
app.post("/api/update-personal-activity", async (req, res) => {
	/*
		{
			id_course
			subject_name
			description
			date_start
			date_end
			
			hour_start,
			hour_end,
			dia
			
			
			TIMES es un arreglo que contiene la información del tiempo de todas
			las actividades de un día concreto y tiene la siguiente estructura

			times: [
				[ACT_ID, START_HOUR, END_HOUR, START_DATE, END_DATE],
				...,
				[ACT_ID, START_HOUR, END_HOUR, START_DATE, END_DATE]
			]
			
		}
	*/
	const ID_USER = req.body.id_user;
	const ID_CURSO = req.body.id_course;

	const NAME = req.body.subject_name;
	const DESC = req.body.description;

	const STA_DATE = req.body.date_start;
	const END_DATE = req.body.date_end;

	const STA_HOUR = req.body.start_hour;
	const END_HOUR = req.body.end_hour;

	const DAY = req.body.day;

	let TIMES = await Con.GetTimesData(ID_USER, DAY)
	TIMES = TIMES.map(element =>{

		return (element.IsDeleted || ID_CURSO == element.idcourse) ? null : [element.idcourse, element.StartHour, element.EndHour, element.FechaInicio, element.FechaFinal]
	}).filter(e => e !== null);

	try {
		if (
			PersonalAct.hasCollisions(
				TIMES,
				ID_CURSO,
				STA_HOUR,
				END_HOUR,
				STA_DATE,
				END_DATE
			)
		) {
			return res.status(400).json({
				error: "Colisión de horarios"
			});
		}	

		const RESULT = await Con.updatePersonalActivity(
			ID_CURSO,
			NAME,
			DESC,
			STA_DATE,
			END_DATE,
			DAY,
			STA_HOUR,
			END_HOUR
		);

		const SUCCESS = RESULT != undefined;
		return res.status(200).json({
			success: SUCCESS
		});
	} catch (error) {
		console.error(error);

		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

// Eliminar actividad personal
app.post("/api/remove-personal-activity", async (req, res) => {
	/*
    data = {
      IdCurso: [ID]
    }
  */
	const ID = req.body.IdPersonalSchedule;

	try {
		const RESULT = await Con.deleteOrRecoveryPersonalScheduleByIdCourse(
			true,
			ID
		);

		const SUCCESS = RESULT != undefined;
		return res.status(200).json({
			success: SUCCESS
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

// Obtener tipos de curso
app.get("/api/course-types", async (req, res) => {
	let data = await Con.GetTiposCurso();

	let tiposCurso = data
		.map(eachData => {
			if (eachData.B_isDeleted == true) {
				return null;
			}

			return eachData.T_nombre;
		})
		.filter(tipo => tipo !== null);

	return res.json(tiposCurso);
});

// Obtener los periodos académicos
app.get("/api/academic-periods", async (req, res) => {
	let data = await Con.GetAcademicPeriods();

	console.log(data)

	return res.json(data);
});

//	--------------------------------------- COMENTARIOS -------------------------------------- \\

//	Sacar los comentarios
app.get("/api/get-personal-comments/:idUser", async (req, res) => {
	const ID_USER = req.params.idUser;

	try {
		const RESULT = await Con.GetPersonalComments(ID_USER);

		let comentarios = RESULT.map(eachData => {

			return eachData.B_isDeleted.Bool ? null : eachData;
		}).filter(comment => comment != null);

		return res.status(200).json({
			success: true,
			data: comentarios
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

//	Sacar los comentarios por curso
app.get("/api/get-personal-course-comments/:idUser/:idCourse", async (req, res) => {
	const ID_USER = req.params.idUser;
	const ID_COURSE = req.params.idCourse
	try {
		const RESULT = await Con.GetPersonalCourseComments(ID_USER, ID_COURSE);

		let comentarios = RESULT.map(eachData => {

			return eachData.B_isDeleted.Bool ? null : eachData;
		}).filter(comment => comment != null);

		return res.status(200).json({
			success: true,
			data: comentarios
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

//	Agregar comentario
app.post("/api/add-comment", async (req, res) => {
	const N_ID_HORARIO = req.body.N_idHorario;
	const T_COMENTARIO = req.body.T_comentario;

	try {
		const RESULT = await Con.addPersonalComment(
			N_ID_HORARIO,
			T_COMENTARIO
		);

		return res.status(200).json({
			success: true,
			data: RESULT
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

// Actaulizar comentario
app.post("/api/update-comment", async (req, res) => {
	const ID = req.body.N_idComentarios;
	const NEW_COMMENT = req.body.T_comentario;

	try {
		if (!ID || !NEW_COMMENT) {
			return res.status(400).json({
				error: "Faltan datos obligatorios"
			});
		}

		const RESULT = await Con.updatePersonalComment(ID, NEW_COMMENT);

		const success = RESULT != undefined;

		return res.status(200).json({
			success: success,
			data: RESULT
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

//	Quitar comentario
app.post("/api/remove-comment", async (req, res) => {
	const ID = req.body.N_idComentarios;

	try {
		const RESULT = await Con.deletePersonalComment(ID);
		const success = RESULT != undefined;

		return res.status(200).json({
			success: success,
			data: RESULT
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

//	--------------------------------------- TAGS -------------------------------------- \\

// Obtener etiquetas por id usuario
app.get("/api/tags-by-user/:userId", async (req, res) => {
	try {
		const data = await Con.GetTagsByUserId(req.params.userId);

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

app.get("/api/tags-by-user-and-reminder/:userId/:reminderId", async (req, res) => {
	try {
		const data = await Con.GetTagsByUserAndCourse(
			req.params.userId,
			req.params.reminderId
		);

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
		return res.status(500).json({success: false, error: error.message, data: null});
	}
});

// Eliminar etiqueta
app.post("/api/delete-tag", async (req, res) => {
	try {
		const {IdTag} = req.body.idTag;

		if (!IdTag) {
			return res.status(400).json({success: false, error: "IdTag requerido"});
		}

		const result = await Con.DeleteTag(IdTag);
		return res.status(200).json({success: true, data: result});
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({success: false, error: error.message});
	}
});

//	--------------------------------------- RECORDATORIOS -------------------------------------- \\
app.get("/api/reminders-tags-by-user/:userId", async (req, res) => {
	let data = await Con.getRemindersTags(req.params.userId);

	let todo_id = -1;
	let reminder_pos = -1;
	let reminders = [];

	data.forEach(eachData => {
		console.log(eachData.B_isDeleted);

			console.log(eachData)

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
});

app.get("/api/reminders-by-user/:userId", async (req, res) => {
	let data = await Con.getReminders(req.params.userId);

	let Reminders = data
		.map(eachData => {
			console.log(eachData.B_isDeleted);

			if (eachData.IsDeleted?.Bool == true) {
				return null;
			}

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

			);

			return reminder.getData();
		})
		.filter(reminder => reminder !== null);

	return res.json(Reminders);
});

// Añadir recordatorio
app.post("/api/add-reminder", async (req, res) => {
    const IDUSER = req.body.P_usuario;
    const TASK_NAME = req.body.P_nombre;
    const DESC = req.body.P_descripcion;
    const DATE = req.body.P_fecha;
	const PRIORY = req.body.P_prioridad;
	const TAG1 = req.body.P_tag1;
	const TAG2 = req.body.P_tag2;
	const TAG3 = req.body.P_tag3;
	const TAG4 = req.body.P_tag4;
	const TAG5 = req.body.P_tag5;

	const USER_CODE = req.body.P_codigo_usuario;

    try {
        const RESULT = await Con.addReminder(
			IDUSER, 
			TASK_NAME, 
			DESC, 
			DATE, 
			PRIORY,
			TAG1,
			TAG2,
			TAG3,
			TAG4,
			TAG5
		);

		const ID_TO_DO = RESULT.InsertedId;
		const USER_QUERY = await userData(USER_CODE);
		const USER_NAME = USER_QUERY.nombre;
		const ADVANCE_NOTICE = USER_QUERY.antelacionNotis;
		const CLIENT_EMAIL = USER_QUERY.correo;

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

// Eliminar recordatorio
app.post("/api/remove-reminder", async (req, res) => {
	const ID = req.body.N_idRecordatorio;

	try {
		const RESULT = await Con.deleteReminder(ID);

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

// Actualizar nombre de recordatorio
app.post("/api/update-name-reminder", async (req, res) => {
	const ID = req.body.P_idToDo;
	const NEW_NAME = req.body.P_nombre;

	console.log(NEW_NAME, ID);

	try {
		const RESULT = await Con.updateNameReminder(ID, NEW_NAME);

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

// Actualizar descripción de recordatorio
app.post("/api/update-desc-reminder", async (req, res) => {
	const ID = req.body.P_idToDo;
	const NEW_DESC = req.body.P_descripcion;

	console.log(NEW_DESC, ID);

	try {
		const RESULT = await Con.updateDescReminder(ID, NEW_DESC);

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

// Actualizar fecha de recordatorio
app.post("/api/update-date-reminder", async (req, res) => {
	const ID = req.body.P_idToDo;
	const NEW_DATE = req.body.P_fecha;

	console.log(NEW_DATE, ID);

	try {
		const RESULT = await Con.updateDateReminder(ID, NEW_DATE);

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

// Actualizar prioridad de recordatorio
app.post("/api/update-priority-reminder", async (req, res) => {
	const ID = req.body.P_idToDo;
	const NEW_PRIORY = req.body.P_prioridad;

	console.log(NEW_PRIORY, ID);

	try {
		const RESULT = await Con.updatePrioryReminder(ID, NEW_PRIORY);

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

// Actualizar estado de recordatorio
app.post('/api/update-state-reminder', async (req, res) =>{
	const ID = req.body.P_idToDo;
	const NEW_STATE = req.body.P_estado;

	try {
		const RESULT = await Con.updateStateReminder(
			ID,
			NEW_STATE
			
		);

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

// Actualizar etiquetas de recordatorio
app.post('/api/update-tags-reminder', async (req, res) =>{
	const ID = req.body.P_idToDo;
	const NEW_TAG1 = req.body.P_tag1;
	const NEW_TAG2 = req.body.P_tag2;
	const NEW_TAG3 = req.body.P_tag3;
	const NEW_TAG4 = req.body.P_tag4;
	const NEW_TAG5 = req.body.P_tag5;

	try {
		const RESULT = await Con.updateTagsReminder(
			ID,
			NEW_TAG1,
			NEW_TAG2,
			NEW_TAG3,
			NEW_TAG4,
			NEW_TAG5
			
		);

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

//	--------------------------------------- NOTIFICACIONES -------------------------------------- \\
// Obtener notificaciones por id
app.get("/api/notifications-by-user/:userId", async (req, res) => {
	let data = await Con.getNotifications(req.params.userId);
	console.log(data);

	let notifications = data
		.map(eachData => {
			let notification = new Notification(
				eachData.idNotificacion,
				eachData.idUsuario,
				eachData.idRecordatorio,
				eachData.nombre,
				eachData.descripcion,
				eachData.fechaEmision

			);
			return notification.getData();

		})
		.filter(notification => notification !== null);

	return res.json(notifications);
});

// Añadir notificaciones
app.post('/api/add-notification', async (req, res) =>{
	const ID_TO_DO = req.body.idToDoList;
	const NAME = req.body.nombre;
	const DESC = req.body.descripcion;
	const ISSUE_DATE = req.body.fechaEmision;

	try {
		const RESULT = await Con.addNotification(
			ID_TO_DO,
			NAME,
			DESC,
			ISSUE_DATE

	);

	return res.status(200).json({
		success: true,
		data: RESULT
	});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}

});

// Añadir notificaciones
app.post('/api/config-notification', async (req, res) =>{
	const ID = req.body.idUsuario;
	const MAIL = req.body.correo;
	const TIME_MUTE = req.body.antelacionNotis;
	const CELLPHONE = req.body.telefono;

	console.log(ID, MAIL, TIME_MUTE)

	try {
		const RESULT = await Con.configNotifications(
			ID,
			MAIL,
			TIME_MUTE,
			CELLPHONE
		);

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

//	--------------------------------------- IMPORTAR HORARIO -------------------------------------- \\

app.post('/api/import-schedule', async (req, res) =>{
	const NOMBRE = req.body.nombre;
	const SEMESTRE = req.body.semestre;
	const PROGRAMA = req.body.programa;
	const COD_USUARIO = req.body.codUsuario;
	const NRC = req.body.nrc;
	const NOMBRE_CURSO = req.body.nombreCurso;
	const DOCENTE = req.body.docente;
	const CREDITOS = req.body.creditos;
	const MODO_CALIFICAR = req.body.modoCalificar;
	const CAMPUS = req.body.campus;
	const TIPO_CURSO = req.body.tipoCurso;
	const DIA = req.body.dia;
	const HORA_INICIO = req.body.horaInicio;
	const HORA_FIN = req.body.horaFin;
	const SALON = req.body.salon;
	const PERIODO_ACADEMICO = req.body.periodoAcademico;

	try {
		const RESULT = await Con.importSchedule(
			NOMBRE,
			SEMESTRE,
			PROGRAMA,
			COD_USUARIO,
			NRC,
			NOMBRE_CURSO,
			DOCENTE,
			CREDITOS,
			MODO_CALIFICAR,
			CAMPUS,
			TIPO_CURSO,
			DIA,
			HORA_INICIO,
			HORA_FIN,
			SALON,
			PERIODO_ACADEMICO
		);
		let temp = NOMBRE;
		const temp2 = COD_USUARIO
		temp = temp.split(" ")[0];
		temp = temp.toLowerCase();
		temp = temp.charAt(0).toUpperCase() +temp.slice(1);
		const PASS = temp + "@" + temp2
		const RESULT1 = await Con.adduser(COD_USUARIO, PASS);
		
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

//	--------------------------------------- INFO DEL USUARIO -------------------------------------- \\

//	Sacar la info del usuario
app.get("/api/get-user-data/:idUser", async (req, res) => {
	const ID_USER = req.params.idUser;

	try {
		const RESULT = await Con.getUserData(ID_USER);

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

//	------------------------ FUNCIONALIDADES DEL LDAP ------------------------ //

app.post("/api/auth/create-user", async (req, res) => {
	const USER = req.body.user;
	const PASS = req.body.pass;
	try {
		const RESULT = await Con.adduser(USER, PASS);
		const success = RESULT != undefined;
		return res.status(200).json({
			success: success
		});
	} catch (error) {
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});
	
app.get("/api/auth/userdata/:id", async (req,res) => {
	const ID = req.params.id;
	try {
		const RESULT = await Con.getUserData(ID);
		return res.status(200).json({
			success: true,
			data: RESULT
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

app.post("/api/auth/validate-user", async (req, res) => {
	const USER = req.body.user;
	const PASS = req.body.pass;
	try {
		const RESULT = await Con.authuser(USER, PASS);
		const success = RESULT != undefined;
		return res.status(200).json({
			success: success,
			jwt_token: RESULT.Token,
			role: RESULT.UserAuth.Roles
		});
	} catch (error) {
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}

});

app.post("/api/auth/add-admin", async (req, res) => {
	const USER = req.body.user;
	const PASS = req.body.pass;
	try {
		const RESULT = await Con.adduseradmin(USER, PASS);
		const success = RESULT != undefined;
		return res.status(200).json({
		success: success,
		});
	} catch (error) {
		return res.status(500).json({
		error: "Error interno del servidor",
		});
	}
});

function validatePasswordPolicy(password) {
	const value = String(password || "");

	if (value.length < 8) {
		return "La contraseña debe tener al menos 8 caracteres";
	}

	if (!/[a-z]/.test(value)) {
		return "La contraseña debe incluir al menos una letra minúscula";
	}

	if (!/[A-Z]/.test(value)) {
		return "La contraseña debe incluir al menos una letra mayúscula";
	}

	if (!/\d/.test(value)) {
		return "La contraseña debe incluir al menos un número";
	}

	if (!/[^A-Za-z0-9\s]/.test(value)) {
		return "La contraseña debe incluir al menos un símbolo";
	}

	return null;
}

app.post("/api/auth/changepassword", async (req, res) => {
	const USER = req.body.user;
	const PASS = req.body.pass;
	if (!USER || !PASS) {
		return res.status(400).json({
			success: false,
			message: "user y pass son obligatorios"
		});
	}

	const policyError = validatePasswordPolicy(PASS);
	if (policyError) {
		return res.status(400).json({
			success: false,
			message: policyError
		});
	}

	try {
		const RESULT = await Con.changepassword(USER, PASS);
		if (!RESULT) {
			return res.status(502).json({
				success: false,
				message: "No se recibio respuesta valida del servicio LDAP"
			});
		}

		return res.status(200).json({
			success: true,
			message: RESULT.message || "Contraseña cambiada correctamente"
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || "Error interno del servidor"
		});
	}
});

// --------------------------------------- ENVIO DE TOKEN ------------------------------------


app.post('/api/send-code', async (req, res) => {
    const USER_CODE = req.body.codUsuario;

    try {
        const url = `http://${process.env.API_ADDR}:${process.env.API_PORT}/api/v1/users/${USER_CODE}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const jsonResponse = await response.json();
    
        const USER_DATA = jsonResponse[0];
		console.log(USER_DATA);
		
        
        if (!USER_DATA || !USER_DATA.idUsuario) {
            console.log("Respuesta de API sin datos de usuario:", jsonResponse);
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const USER_ID = USER_DATA.idUsuario.toString();
        const USER_NAME = USER_DATA.nombre || "Usuario";
        const CLIENT_EMAIL = USER_DATA.correo;

        // Generar token
        const TOKEN = Math.floor(100000 + Math.random() * 900000).toString();

        await saveTokenAndSendEmail(
            USER_ID,    
            TOKEN, 
            USER_NAME,            
            CLIENT_EMAIL
        );

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error en send-code:", error.message);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Guardar token en la base de datos y enviar email
const saveTokenAndSendEmail = async (userId, token, userName, email) => {
    try {
        // Guardar token en la base de datos
		console.log("user:", userId, " token:", token)
        await Con.receiveTokenData(userId, token); 
        console.log("Token guardado correctamente.");

        // Estructura de correo
        const emailData = {
            user: userName,
            token: token,
            minutos: "15",
            destinatario: email,
        };

        // Envío de correo
        console.log(`Enviando correo a ${email}...`);
        const emailResponse = await fetch("http://" + process.env.EMAIL_ADDR + ":" + process.env.EMAIL_PORT + "/api/sendEmailToken", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });

        if (!emailResponse.ok) {
            const errorDetail = await emailResponse.json().catch(() => ({}));
            throw new Error(errorDetail.message || "Servidor de correo rechazó la solicitud");
        }

        console.log(`Correo enviado con éxito a ${email}!`);

    } catch (error) {
        console.error("Hubo un fallo en el proceso:", error.message);
    }

};

// Validar token
app.post('/api/validate-token', async (req, res) =>{
	const USER_TOKEN = req.body.token;
	const USER_ID = req.body.userId.toString();

	console.log(USER_TOKEN);
	console.log(USER_ID);
	
    try {
        // Guardar token en la base de datos
        const RESPONSE = await Con.getToken(`reset:${USER_ID}`, USER_TOKEN);
		const userId = RESPONSE.userId;

		// Si userId NO es null el token es válido
        if (userId) {
            console.log("Token válido para el usuario:", userId);
            
            return res.status(200).json({ 
                success: true, 
                message: "Token encontrado",
                userId: userId 
            });
        } else {
            console.log("El token no existe o ya expiró.");
    
            return res.status(401).json({ 
                success: false, 
                message: "Token inválido o expirado" 
            });
        }

    } catch (error) {
        console.error("Hubo un fallo en el proceso:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "Error interno del servidor" 
        });
    }

});

//	------------------------ FUNCIONES EXTRA ------------------------ //

// Obtener info del usuario

const scheduleEmailAndNotification = async (idToDo, userName, title, content, dateStr, advanceNotice, email, userCode) => {
    // Lógica de fechas
    const ISO_DATE = dateStr.replace(" ", "T");
    const FINAL_DATE = new Date(ISO_DATE);
    const [H, M, S] = advanceNotice.split(':').map(Number);
    const MILISECONDS_TO_SUBTRACT = ((H * 3600) + (M * 60) + S) * 1000;

    const ALERT_DATE = new Date(FINAL_DATE.getTime() - MILISECONDS_TO_SUBTRACT);
    const NOW = new Date();

    const delay = ALERT_DATE.getTime() - NOW.getTime();

    if (delay > 0) {
        await reminderQueue.add('send-reminder', {
            idToDo, userName, title, content, dateStr, email,
            finalDateStr: FINAL_DATE.toISOString()
        }, {
			delay: delay,
            jobId: `${userCode}-${idToDo}`,
            removeOnComplete: true,
            removeOnFail: false
        });

        console.log(`[BullMQ] Recordatorio "${title}" agendada con ID: todo-${idToDo} (Faltan ${delay / 1000} seg).`);
    } else {
        console.log("La hora de aviso ya pasó. No se puede programar.");
    }
};

// Bloquear notificaciones temporalmente
app.post('/api/stop-all-notifications', async (req, res) => {
    try {
        const { codUsuario } = req.body;

        // Validación de entrada
        if (!codUsuario) {
            return res.status(400).json({ error: "Falta el parámetro codUsuario en el cuerpo de la petición." });
        }

        console.log(`\nDETENIENDO NOTIFICACIONES: Usuario ${codUsuario} ---`);

        // Obtener los trabajos de la cola en diferentes estados
        const jobs = await reminderQueue.getJobs(['waiting', 'delayed', 'active']);

        let count = 0;

        for (const job of jobs) {
            const isUserJob = job.id.startsWith(`${codUsuario}-`) || 
			job.data.codUsuario == codUsuario;

            if (isUserJob) {
                try {
                    await job.remove();
                    count++;
                    console.log(`Eliminado Job ID: ${job.id}`);
                } catch (removeError) {
                    console.warn(`No se pudo eliminar el job ${job.id}: ${removeError.message}`);
                }
            }
        }

        console.log(`Limpieza terminada: ${count} tareas eliminadas para ${codUsuario} ---\n`);

        res.json({ 
            success: true, 
            message: `Se han cancelado tus ${count} notificaciones pendientes.`,
            detalles: {
                usuario: codUsuario,
                eliminados: count
            }
        });

    } catch (error) {
        console.error("ERROR CRÍTICO AL DETENER NOTIFICACIONES:", error);
        res.status(500).json({ 
            error: "Error interno del servidor al limpiar la cola de Redis.",
            detalle: error.message 
        });
    }
});

// Revisar registros en la bd redis
app.get('/api/debug-redis', async (req, res) => {
    try {
        // Obtener conteos de BullMQ
        const counts = await reminderQueue.getJobCounts();
        
        // Obtener los últimos 10 trabajos agendados
        const delayedJobs = await reminderQueue.getDelayed(0, 10);
        
        res.json({
            resumen: counts,
            detalles_futuros: delayedJobs.map(j => ({
                id: j.id,
                data: j.data,
                timestamp: new Date(j.timestamp)
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reanudar notificaciones
app.post('/api/restore-notifications', async (req, res) => {
    try {
        const { codUsuario } = req.body;
        if (!codUsuario) return res.status(400).json({ error: "Falta codUsuario" });

        console.log(`\nRESTAURACIÓN: Usuario ${codUsuario} ---`);

        // Datos del Usuario 
        const user = await userData(codUsuario);
        
        // Datos de Go 
        const rawReminders = await Con.getReminders(codUsuario);
        const reminders = Array.isArray(rawReminders) ? rawReminders : [];

        if (reminders.length === 0) {
            return res.status(404).json({ message: "Sin tareas para este usuario." });
        }

        let count = 0;
        const ahora = new Date();

        for (const r of reminders) {
            // Limpieza de datos
            const idToDo = r.N_idToDoList;
            const titulo = r.T_nombre;
            const desc = r.T_descripcion.Valid ? r.T_descripcion.String : "";
            const fechaRaw = r.Dt_fechaVencimiento.Valid ? r.Dt_fechaVencimiento.String : null;
            
            // Estados
            const isDeleted = r.B_isDeleted;
            const isPending = r.B_estado;

            if (!fechaRaw) continue;

            // LÓGICA DE TIEMPO 
            const fechaVencimiento = new Date(fechaRaw);
            const fechaAlerta = calcularFechaAlerta(fechaVencimiento, user.antelacionNotis);

            if (!isDeleted && !isPending && fechaAlerta > ahora) {
                
                console.log(`Agendando: "${titulo}" | Alerta: ${fechaAlerta.toLocaleString()}`);

                await scheduleEmailAndNotification(
                    idToDo,             
                    user.nombre,        
                    titulo,               
                    desc,               
                    fechaRaw,              
                    user.antelacionNotis, 
                    user.correo,           
                    codUsuario         
                );
                
                count++;
            } else {
                console.log(`Omitida: "${titulo}" (Alerta pasada o tarea inactiva)`);
            }
        }

        console.log(`TERMINADO: ${count} restaurados ---\n`);

        res.json({ 
            success: true, 
            message: `Sincronización exitosa.`, 
            total_restaurado: count 
        });

    } catch (error) {
        console.error("Error Crítico:", error.message);
        res.status(500).json({ error: "Fallo en la sincronización.", detalle: error.message });
    }
});


//Calcula la fecha exacta de la notificación restando la antelación
function calcularFechaAlerta(vencimiento, antelacion) {
    if (!antelacion || !antelacion.includes(':')) return vencimiento;
    
    const [h, m, s] = antelacion.split(':').map(Number);
    const alerta = new Date(vencimiento);
    
    alerta.setHours(alerta.getHours() - (h || 0));
    alerta.setMinutes(alerta.getMinutes() - (m || 0));
    alerta.setSeconds(alerta.getSeconds() - (s || 0));
    
    return alerta;
}

// Llamado al puerto
app.listen(PORT);





