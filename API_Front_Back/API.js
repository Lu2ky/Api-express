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
dotenv.config();

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
app.get("/api/upd-personalactivityname/", async (data, res) => {
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

app.get("/api/upd-personalactivitydelorre/", async (data, res) => {
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

app.get("/api/upd-personalactivitytime/", async (data, req) => {
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

app.get("/api/add-personal-activity/", async (data, res) => {
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
    }
  */
	const NAME = data.name;
	const TAG = data.tag;
	const DESC = data.desc;
	const DAY = data.day;
	const STA_HOUR = data.startHour;
	const END_HOUR = data.endHour;
	const ID_USER = data.idUser;
	const ID_ACADEMIC_PER = data.idAcademicPer;

	const RESULT = await addPersonalActivity(
		NAME,
		TAG,
		DESC,
		DAY,
		STA_HOUR,
		END_HOUR,
		ID_USER,
		ID_ACADEMIC_PER
	);

	return RESULT;
});

app.listen(PORT);
