import {Connection} from "../Connection.js";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";
import {officialAct} from "../OfficialAct.js";
import {PersonalAct} from "../PersonalAct.js";
import express from "express";
import cors from "cors";
import {stringify} from "querystring";
import {Reminder} from "../Reminder.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({
	path: resolve(__dirname, "../../../config/expressapiconfig.env")
});

const app = express();
const PORT = 28523;
app.use(cors());
app.use(express.json());

let Con = new Connection();

// Obtener horario oficial
app.get("/api/official-schedule/:userId", async (req, res) => {

	const USER_ID = req.params.userId;

	try {
		let data = await Con.GetOfficialScheOfficduleByUserId(USER_ID);
		
		const ACTIVITIES = data.map(eachData => {
			let OfficialActivity = new officialAct(
				eachData.Course,
				eachData.Teacher,
				eachData.Classroom,
				eachData.Nrc,
				[eachData.StartHour, eachData.EndHour, eachData.Day],
				eachData.Tag,
				eachData.AcademicPeriod,
				eachData.Campus,
				{
					Float64: eachData.Credits.Float64,
					Valid: eachData.Credits.Valid
				}
			);

			return OfficialActivity.getData();
		});


		res.status(200).json({
			success: true,
			data: ACTIVITIES
		});
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
			console.log(
				eachData.N_idcourse,
				eachData.IsDeleted,
				eachData.IsDeleted.Bool
			);

			if (eachData.IsDeleted.Bool == true) {
				return null;
			}

			let PersonalActivity = new PersonalAct(
				eachData.N_idcourse,
				eachData.Activity,
				eachData.Description,
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
app.post("/api/update-personal-activity-description", async (req, res) => {
	/*
    data = {
      NewActivityValue: [NEW DESCRIPTION]
      IdCurso: [ID]
    }
  */
	const NEW_NAME = req.body.NewActivityValue;
	const ID = req.body.IdPersonalSchedule;

	console.log(NEW_NAME, ID);

	try {
		const RESULT = await Con.updateDescriptionOfPersonalScheduleByIdCourse(
			NEW_NAME,
			ID
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

// Editar nombre de actividad personal
app.post("/api/update-personal-activity-name", async (req, res) => {
	/*
    data = {
      NewActivityValue: [NEW NAME]
      IdCurso: [ID]
    }
  */
	const NEW_NAME = req.body.NewActivityValue;
	const ID = req.body.IdPersonalSchedule;

	console.log(NEW_NAME, ID);

	try {
		const RESULT = await Con.updateNameOfPersonalScheduleByIdCourse(
			NEW_NAME,
			ID
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

// Eliminar actividad personal
app.post("/api/remove-personal-activity", async (req, res) => {
	/*
    data = {
      NewActivityValue: [NEW_STATUS]
      IdCurso: [ID]
    }
  */
	const NEW_STATUS = req.body.NewActivityValue;
	const ID = req.body.IdPersonalSchedule;

	try {
		const RESULT = await Con.deleteOrRecoveryPersonalScheduleByIdCourse(
			NEW_STATUS,
			ID
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

// Editar fecha de actividad pesonal
app.post("/api/update-personal-activity-time/", async (req, res) => {
	/*
    data = {
      StartHour: [NEW_STA_HOUR],
      EndHour: [NEW_END_HOUR]
      IdCurso: [ID]
	  Times: [ARRAY TIMES]

	  EL TIMES NO PUEDE CONTENER EL TIEMPO DE LA ACTIVIDAD QUE SE QUIERE MODIFICAR
    }
  */
	const NEW_STA_HOUR = req.body.StartHour;
	const NEW_END_HOUR = req.body.EndHour;
	const DAY = req.body.Day;
	const ID = req.body.IdCurso;

	const TIMES = req.body.Times;
	const RESULT = [undefined, undefined];

	console.log(NEW_STA_HOUR, NEW_END_HOUR, DAY, ID);
	try {
		if (PersonalAct.hasCollisions(TIMES, NEW_STA_HOUR, NEW_END_HOUR, DAY)) {
			return res.status(400).json({
				error: "Colisión de horarios"
			});
		}

		RESULT[0] = await Con.updateStartHourOfPersonalScheduleByIdCourse(
			NEW_STA_HOUR,
			ID
		);
		RESULT[1] = await Con.updateEndHourOfPersonalScheduleByIdCourse(
			NEW_END_HOUR,
			ID
		);

		return res.status(200).json({
			success: true,
			NEW_STA_H: RESULT[0],
			NEW_END_H: RESULT[1]
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

// Añadir actividad personal
app.post("/api/add-personal-activity", async (req, res) => {
	/*
    data = {
      name: [NAME],
      tag: [TAG]
      desc: [DESC]
      day: [DAY]
      startHour: [STA_HOUR]
      endHour: [END_HOUR]
      idUser: [ID_USER]
      idAcademicPer: [ID_ACADEMIC_PER]
	  times: [ACTIVITY TIMES]
    }
  */

	const NAME = req.body.Activity;
	const DESC = req.body.Description;
	const DAY = req.body.Day;
	const STA_HOUR = req.body.StartHour;
	const END_HOUR = req.body.EndHour;
	const ID_USER = req.body.N_iduser;
	const ID_ACADEMIC_PER = req.body.Id_AcademicPeriod;

	const TIMES = req.body.Times;

	try {
		if (PersonalAct.hasCollisions(TIMES, STA_HOUR, END_HOUR, DAY)) {
			return res.status(400).json({
				error: "Colisión de horarios"
			});
		}

		const RESULT = await Con.addPersonalActivity(
			NAME,
			DESC,
			DAY,
			STA_HOUR,
			END_HOUR,
			ID_USER,
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

/**
 * Se obtienen las etiquetas como un arreglo.
 */
//
app.get("/api/get-tags", async (req, res) => {
	let data = await Con.GetTags();

	let tags = data.map(eachData => {
		return eachData.T_name;
	});

	return res.json(tags);
});

app.get("/api/reminders-by-user/:userId", async (req, res) => {
	let data = await Con.GetReminders(req.params.userId);

	let Reminders = data.map(eachData => {
		console.log(
			eachData.B_isDeleted,

		);

		if(eachData.IsDeleted?.Bool == true){
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
				eachData.T_Prioridad

			);

			return reminder.getData();

	})
	.filter(reminder => reminder !== null);

	return res.json(Reminders);
});

// Añadir recordatorio
app.post('/api/add-reminder', async (req, res) =>{
		const IDUSER = req.body.P_usuario;
		const NAME = req.body.P_nombre;
		const DESC = req.body.P_descripcion;
		const DATE = req.body.P_fecha;
		const PRIORY = req.body.P_prioridad;
		const TAG1 = req.body.P_tag1;
		const TAG2 = req.body.P_tag2;
		const TAG3 = req.body.P_tag3;
		const TAG4 = req.body.P_tag4;
		const TAG5 = req.body.P_tag5;

		try {
			const RESULT = await Con.addReminder(
				IDUSER,
				NAME,
				DESC,
				DATE,
				PRIORY,
				TAG1,
				TAG2,
				TAG3,
				TAG4,
				TAG5
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

// Eliminar recordatorio
app.post("/api/remove-reminder", async (req, res) => {
	const ID = req.body.N_idRecordatorio;
	
	try {
		const RESULT = await Con.deleteReminder(
			ID
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

// Actualizar nombre de recordatorio
app.post('/api/update-name-reminder', async (req, res) =>{
	const ID = req.body.P_idToDo;
	const NEW_NAME = req.body.P_nombre;

	console.log(NEW_NAME, ID);

	try {
		const RESULT = await Con.updateNameReminder(
			ID,
			NEW_NAME
			
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

// Actualizar descripción de recordatorio
app.post('/api/update-desc-reminder', async (req, res) =>{
	const ID = req.body.P_idToDo;
	const NEW_DESC = req.body.P_descripcion;

	console.log(NEW_DESC, ID);

	try {
		const RESULT = await Con.updateDescReminder(
			ID,
			NEW_DESC
			
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

// Actualizar fecha de recordatorio
app.post('/api/update-date-reminder', async (req, res) =>{
	const ID = req.body.P_idToDo;
	const NEW_DATE = req.body.P_fecha;

	console.log(NEW_DATE, ID);

	try {
		const RESULT = await Con.updateDateReminder(
			ID,
			NEW_DATE
			
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

// Actualizar prioridad de recordatorio
app.post('/api/update-priory-reminder', async (req, res) =>{
	const ID = req.body.P_idToDo;
	const NEW_PRIORY = req.body.P_prioridad;

	console.log(NEW_PRIORY, ID);

	try {
		const RESULT = await Con.updatePrioryReminder(
			ID,
			NEW_PRIORY
			
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

// Llamado al puerto
app.listen(PORT);

// TO DO

// - Add etiqueta
// - Edit etiqueta
// - Delete etiqueta

// - Get Comentarios [Ya está en GO]
// - Add comentario [Ya está en GO]
// - Edit comentario
// - Delete comentario

// - Get tiposCurso 




