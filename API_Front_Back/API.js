import {Connection} from "../Connection.js";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
import dotenv from "dotenv";
import {officialAct} from "../OfficialAct.js";
import {PersonalAct} from "../PersonalAct.js";
import express from "express";
import cors from "cors";
import { stringify } from "querystring";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

const app = express();
const PORT = 28523;
app.use(cors());
app.use(express.json());

let Con = new Connection();

app.get("/api/official-schedule/:userId", async (req, res) => {

	const USER_ID = req.params.userId;

	try {
		let data = await Con.GetOfficialScheduleByUserId(USER_ID);
		
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

app.get("/api/personal-schedule/:userId", async (req, res) => {
	let data = await Con.GetPersonalScheduleByUserId(req.params.userId);

	let PersonalActivitys = data
		.map(eachData => {

			console.log(eachData.N_idcourse, eachData.IsDeleted, eachData.IsDeleted.Bool)

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
	const DAY = req.body.Day
	const ID = req.body.IdCurso;

	const TIMES = req.body.Times;
	const RESULT = [undefined, undefined];

	console.log(NEW_STA_HOUR, NEW_END_HOUR, DAY, ID)
	try {

		if (PersonalAct.hasCollisions(TIMES, NEW_STA_HOUR, NEW_END_HOUR, DAY)){
			return res.status(400).json({
				error: "Colisión de horarios"
			});
		}

		RESULT[0] = await Con.updateStartHourOfPersonalScheduleByIdCourse(NEW_STA_HOUR, ID);
		RESULT[1] = await Con.updateEndHourOfPersonalScheduleByIdCourse(NEW_END_HOUR, ID);

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
		if (PersonalAct.hasCollisions(TIMES, STA_HOUR, END_HOUR, DAY)){
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


app.get("/api/get-personal-comments/:idUser/:idCourse", async (req, res) => {

  const ID_USER = req.params.idUser;
  const ID_COURSE = req.params.idCourse;

  

  try {

    const RESULT = await Con.GetPersonalComments(
      ID_USER,
      ID_COURSE
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

app.post("/api/add-comment", async (req, res) => {
  
  const N_ID_HORARIO = req.body.N_idHorario;
  const N_ID_USUARIO = req.body.N_idUsuario;
  const N_ID_CURSO = req.body.N_idCurso;
  const CURSO = req.body.Curso;
  const T_COMENTARIO = req.body.T_comentario;



  try {

   
    if (!N_ID_HORARIO || !N_ID_USUARIO || !N_ID_CURSO || !T_COMENTARIO) {
      return res.status(400).json({
        error: "Faltan datos obligatorios",
      });
    }

    const RESULT = await Con.addPersonalComment(
      N_ID_HORARIO,
      N_ID_USUARIO,
      N_ID_CURSO,
      CURSO,
      T_COMENTARIO
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

//update comment

app.post("/api/update-comment", async (req, res) => {


  const ID = req.body.N_idComentarios;
  const NEW_COMMENT = req.body.T_comentario;

  try {

    if (!ID || !NEW_COMMENT) {
      return res.status(400).json({
        error: "Faltan datos obligatorios"
      });
    }

    const RESULT = await Con.updatePersonalComment(
      ID,
      NEW_COMMENT
    );

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