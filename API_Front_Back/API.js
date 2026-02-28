import { Connection } from "../Connection.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import { officialAct } from "../OfficialAct.js";
import { PersonalAct } from "../PersonalAct.js";
import express from "express";
import cors from "cors";
import { stringify } from "querystring";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//INTERCAMBIAR ESTAS DOS LINEAS SI SE QUIERE EJECUTAR EN LOCAL O SI SE SUBIRÁ A PRODUCCION

//dotenv.config();	//PROD
dotenv.config({path: resolve(__dirname, "../../../config/expressapiconfig.env")});	//LOCAL

const app = express();
const PORT = 28523;
app.use(cors());
app.use(express.json());

let Con = new Connection();

//	Obtener horario oficial

app.get("/api/official-schedule/:userId", async (req, res) => {

	//	req.params permite obtener los valoeres dados por medio de la URL
	const USER_ID = req.params.userId;

	try {
		//Petición a la API de Go
		let data = await Con.GetOfficialScheduleByUserId(USER_ID);
		
		//Procesamiento de los datos.
		const ACTIVITIES = data.map(eachData => {
			
			//	Codigo de calidad (no)
			GLOBAL_USER = eachData.N_iduser;

			let OfficialActivity = new officialAct(
				eachData.Course,
				eachData.Teacher,
				eachData.Classroom,
				eachData.Nrc,
				[
					eachData.StartHour,
					eachData.EndHour,
					eachData.Day
				],
				eachData.Tag,
				eachData.AcademicPeriod,
				eachData.Campus,
				eachData.Credits
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

//	Obtener el horario personal
app.get("/api/personal-schedule/:userId", async (req, res) => {
  let data = await Con.GetPersonalScheduleByUserId(req.params.userId);

  let PersonalActivitys = data.map((eachData) => {

      if (eachData.IsDeleted.Bool == true) {
        return null;
      }

      let PersonalActivity = new PersonalAct(
        eachData.N_idcourse,
        eachData.Activity,
        eachData.Description.Valid ? eachData.Description.String : null,
        [
			eachData.StartHour,
			eachData.EndHour,
			eachData.Day
		],
        eachData.Tag,
        eachData.Dt_Start.String,
        eachData.Dt_End.String,
      );

      return PersonalActivity.getData();
    })
    .filter((activity) => activity !== null);

  	return res.json(PersonalActivitys);
});

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
	
	const TIMES = req.body.times;

  	try {
		if (PersonalAct.hasCollisions(TIMES, -1, STA_HOUR, END_HOUR, STA_DATE, END_DATE)) {
			return res.status(400).json({
				error: "Colisión de horarios",
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
      data: RESULT,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error interno del servidor",
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

	const ID_CURSO = req.body.id_course;

	const NAME = req.body.subject_name;
	const DESC = req.body.description;
	
	const STA_DATE = req.body.date_start;
	const END_DATE = req.body.date_end;

	const STA_HOUR = req.body.start_hour;
	const END_HOUR = req.body.end_hour;

	const DAY = req.body.day;
	
	const TIMES = req.body.times;

	try {
		
		//	Evitar que llegue incompleto el times.
		if (ACT_TIME != null){

			if (PersonalAct.hasCollisions(TIMES, ID_CURSO, STA_HOUR, END_HOUR, STA_DATE, END_DATE)) {
				return res.status(400).json({
					error: "Colisión de horarios",
				});
			}
		}

		const RESULT = await Con.updatePersonalActivity(
			ID_CURSO,
			NAME,
			DESC,
			F_INICIO,
			F_FIN,
			DIA,
			H_INICIO,
			H_FIN
		)

		const SUCCESS = RESULT != undefined;
		return res.status(200).json({
			success: SUCCESS 
		});

	} catch (error) {
		
		console.error(error);

		return res.status(500).json({
		error: "Error interno del servidor",
		});
	}


});

//	Eliminar actividad personal
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
      ID,
    );

    const SUCCESS = RESULT != undefined;
    return res.status(200).json({
      success: SUCCESS,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

/**
 * Se obtienen las etiquetas como un arreglo.
 */
app.get("/api/get-tags", async (req, res) => {
  let data = await Con.GetTags();

  let tags = data.map((eachData) => {
    return eachData.T_name;
  });

  return res.json(tags);
});

// TO DO

// - Add etiqueta
// - Edit etiqueta
// - Delete etiqueta

// - Get Comentarios [Ya está en GO]
// - Add comentario [Ya está en GO]
// - Edit comentario
// - Delete comentario

// - Get recordatorios
// - Add recordatorio
// - Edit recordatorio
// - Delete recordatorio

// - Get tiposCurso 

app.listen(PORT);
