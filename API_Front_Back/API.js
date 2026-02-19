import { Connection } from "../Connection.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import { officialAct } from "../OfficialAct.js";
import { PersonalAct } from "../PersonalAct.js";
import express from "express";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../.env") });

const app = express();
const PORT = 28522;
app.use(cors());
app.use(express.json());

let Con = new Connection();
app.get("/api/official-schedule/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const activities = await getOfficialScheduleForFront(userId);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el horario",
      error: error.message,
    });
  }
});
//getOfficialScheduleForFront("548492")
updateNameOfPersonalScheduleForFront(
  {
    newValue: "hola",
    idPersonal: 52
  }
)

getPersonalScheduleForFront("548492")



async function getOfficialScheduleForFront(id) {
  let data = await Con.GetOfficialScheduleByUserId(id);
  //console.log(data);
  let i = 0;
  let OfficialActivitys = data.map((eachData) => {
    let OfficialActivity = new officialAct(
      eachData.Course, 
      eachData.Teacher,
      eachData.Classroom,
      eachData.Nrc,
      [
        eachData.StartHour,
        eachData.EndHour,
        eachData.Day,
      ],
      eachData.Tag,
      eachData.AcademicPeriod,
      eachData.Campus,
      {
        Float64: eachData.Credits.Float64,
        Valid: eachData.Credits.Valid
      }
    );

    return OfficialActivity.getData();
    /*
    OfficialActivity.teacherName = eachData.Teacher;
    OfficialActivity.place = eachData.Classroom;
    OfficialActivity.NRC = eachData.Nrc;
    OfficialActivity.time = [
      eachData.StartHour,
      eachData.EndHour,
      eachData.Day,
    ];
    OfficialActivity.academicPeriod = eachData.AcademicPeriod;
    OfficialActivity.Campus = eachData.Campus;
    OfficialActivity.credits = eachData.Credits;

    return {
      subject_name: OfficialActivity.name,
      professor_name: OfficialActivity.teacherName,
      classroom: OfficialActivity.place,
      NRC: OfficialActivity.NRC,
      times: OfficialActivity.time,
      Tag: OfficialActivity.tagId,
      academicPeriod: OfficialActivity.academicPeriod,
      Campus: OfficialActivity.Campus,
      Credits: OfficialActivity.credits,
    };*/
  });

  console.log(OfficialActivitys)

  return OfficialActivitys;
}

async function getPersonalScheduleForFront(id) {
  let data = await Con.GetPersonalScheduleByUserId(id);
  //console.log(data);
  let i = 0;
  let deletedActivities = [];

  let PersonalActivitys = data.map((eachData) => {

    const DISABLED = eachData.IsDeleted.Bool;

    if (DISABLED){
      deletedActivities.push(i);
      return null;
    }

    let PersonalActivity = new PersonalAct(
      eachData.N_idcourse,
      eachData.Activity, 
      eachData.Description.String,
      [
        eachData.StartHour,
        eachData.EndHour,
        eachData.Day,
      ],
      eachData.Tag,
      eachData.Dt_Start.String,
      eachData.Dt_End.String,
    );

    i++;
    return PersonalActivity.getData();
  });

  //Evitar enviar actividades eliminadas.
  for (let i = 0; i < deletedActivities.length; i++) {
    deletedActivities.split(deletedActivities[i], 1);
  }

  console.log(PersonalActivitys)

  return PersonalActivitys;
}

async function updateNameOfPersonalScheduleForFront(data) {

  /*
    data = {
      newValue: [NEW_NAME],
      idPersonal: [ID]
    }
  */
  const NEW_NAME = data.newValue;
  const ID = data.idPersonal

  const RESULT = await Con.updateNameOfPersonalScheduleByIdCourse(NEW_NAME, ID);

  return RESULT;
}

async function updateTimeOfPersonalScheduleForFront(data) {

  /*
    data = {
      newValue: [NEW_STATUS]
      idPersonal: [ID]
    }
  */
  const NEW_STATUS = data.newValue;
  const ID = data.idPersonal;
  const RESULT = await Con.deleteOrRecoveryPersonalScheduleByIdCourse(NEW_STATUS, ID);

  return RESULT;
}

async function deleteOrRecoveryPersonalScheduleForFront(data) {

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

  if (NEW_STA_HOUR != undefined) await updateStartHourOfPersonalScheduleByIdCourse(NEW_STA_HOUR, ID);
  if (NEW_STA_HOUR != undefined) await updateEndHourOfPersonalScheduleByIdCourse(NEW_END_HOUR, ID);
}

async function addPersonaActivityForFront(data) {
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
    ID_ACADEMIC_PER,
  )

  return RESULT;
}

app.listen(PORT);
