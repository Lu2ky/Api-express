import {Connection} from "../Connection.js";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";
import {officialAct} from "../OfficialAct.js";
import {PersonalAct} from "../PersonalAct.js";
import express from "express";
import cors from "cors";
import {stringify} from "querystring";

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
app.get("/api/official-schedule/:userId", async (req, res) => {
	try {
		const userId = req.params.userId;
		const activities = await getOfficialScheduleForFront(userId);

		res.status(200).json({
			success: true,
			data: activities
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

//getOfficialScheduleForFront("551542");

async function getOfficialScheduleForFront(id) {
	let data = await Con.GetOfficialScheduleByUserId(id);
	//console.log(data);
	let i = 0;
	let OfficialActivitys = data.map(eachData => {
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
	return OfficialActivitys;
}

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
app.get("/api/get-tags", async (req, res) => {
	let data = await Con.GetTags();

	let tags = data.map(eachData => {
		return eachData.T_name;
	});

	return res.json(tags);
});

app.listen(PORT);
