import {Connection} from "../Connection.js";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";
import {officialAct} from "../OfficialAct.js";
import {PersonalAct} from "../PersonalAct.js";
import express from "express";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../../config/expressapiconfig.env") });

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
			if (eachData.IsDeleted.Bool) {
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

app.post("/api/update-personal-activity-name/", async (data, res) => {
	/*
    data = {
      newValue: [NEW_NAME],
      idPersonal: [ID]
    }
  */
	const NEW_NAME = data.NewActivityValue;
	const ID = data.IdPersonalSchedule;

	const RESULT = await Con.updateNameOfPersonalScheduleByIdCourse(NEW_NAME, ID);

	return RESULT;
});

app.post("/api/remove-personal-activity/", async (data, res) => {
	/*
    data = {
      newValue: [NEW_STATUS]
      idPersonal: [ID]
    }
  */
	const NEW_STATUS = data.NewActivityValue;
	if (typeof NEW_STATUS == "boolean") {
		return;
	}
	const ID = data.IdPersonalSchedule;
	const RESULT = await Con.deleteOrRecoveryPersonalScheduleByIdCourse(
		NEW_STATUS,
		ID
	);

	return RESULT;
});

app.post("/api/update-personal-activity-time/", async (data, req) => {
	/*
    data = {
      startHour: [NEW_STA_HOUR],
      endHour: [NEW_END_HOUR]
      idPersonal: [ID]
    }
  */
	const NEW_STA_HOUR = data.startHour;
	const NEW_END_HOUR = data.endHour;
	const ID = data.idPersonal;

	if (NEW_STA_HOUR != undefined) {
		await updateStartHourOfPersonalScheduleByIdCourse(NEW_STA_HOUR, ID);
	}
	if (NEW_END_HOUR != undefined)
		await updateEndHourOfPersonalScheduleByIdCourse(NEW_END_HOUR, ID);
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
	const DESC = req.body.IdTag;
	const TAG = req.body.Description;
	const DAY = req.body.Day;
	const STA_HOUR = req.body.StartHour;
	const END_HOUR = req.body.EndHour;
	const ID_USER = req.body.N_iduser;
	const ID_ACADEMIC_PER = req.body.Id_AcademicPeriod;
	
	const TIMES = req.body.times;

	try {
		if (PersonalAct.hasCollisions(TIMES, STA_HOUR, END_HOUR)){
			return res.status(400).json({
				error: "Colisión de horarios"
			});

		}

		const RESULT = await Con.addPersonalActivity(
			NAME,
			TAG,
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

//test xd
/*
let postData = {
    Activity: "DESCANSO",
    tag: "Personal",
    desc: "[DESC]",
    day: 1,
    startHour: "06:00:00",
    endHour: "08:00:00",
    idUser: 7,
    idAcademicPer: "[ID_ACADEMIC_PER]",

    times: [
        ["08:00:00", "09:00:00", 1],
        ["09:00:00", "10:40:00", 0],
        ["09:00:00", "10:00:00", 1]
    ]
}

try {
	const response = await fetch('http://localhost:28523/api/add-personal-activity', {
		method: 'POST', // Specify the method
		headers: {
			'Content-Type': 'application/json', // Declare the content type
		},
		body: JSON.stringify(postData), // Convert the data object to a JSON string
	});

	if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }

	const data = await response.text();
    console.log(data);

} catch (error) {
	console.error("error en el fetch:", error);
}
*/