import { Connection } from "../Connection.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import { officialAct } from "../OfficialAct.js";
import { PersonalAct } from "../PersonalAct.js";
import express from "express";
import cors from "cors";
import {stringify} from "querystring";
import {Reminder} from "../Reminder.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//INTERCAMBIAR ESTAS DOS LINEAS SI SE QUIERE EJECUTAR EN LOCAL O SI SE SUBIRÁ A PRODUCCION

dotenv.config();	//PROD
//dotenv.config({path: resolve(__dirname, "../../../config/expressapiconfig.env")});	//LOCAL

const app = express();
const PORT = 28523;
app.use(cors());
app.use(express.json());

let Con = new Connection();

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

// Obtener horario personal
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

// Obtener tipos de curso
app.get("/api/course-types", async (req, res) => {
  let data = await Con.GetTiposCurso();

  let tiposCurso = data.map((eachData) => {

      if (eachData.IsDeleted == true) {
        return null;
      }

      return eachData.T_nombre
    })
    .filter((tipo) => tipo !== null);

  	return res.json(tiposCurso);
});

//	--------------------------------------- COMENTARIOS -------------------------------------- \\

//	Sacar los comentarios
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

//	Agregar comentario
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

        const tags = data.map((eachData) => {

			return eachData.B_isDeleted.Bool ? null : eachData.T_nombre

        }).filter((tag) => tag !== null);

        return res.status(200).json({ success: true, data: tags });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener etiquetas por id usuario e id recordatorio
app.get("/api/tags-by-user-and-course/:userId/:courseId", async (req, res) => {
    try {
        const data = await Con.GetTagsByUserAndCourse(
            req.params.userId,
            req.params.courseId
        );

        const tags = data.map((eachData) => {
			
			return eachData.B_isDeleted.Bool ? null : eachData.T_nombre
			
        }).filter((tag) => tag !== null);

        return res.status(200).json({ success: true, data: tags });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Eliminar etiqueta
app.post("/api/delete-tag", async (req, res) => {
    try {
        const { IdTag } = req.body.idTag;

        if (!IdTag) {
            return res.status(400).json({ success: false, error: "IdTag requerido" });
        }

        const result = await Con.DeleteTag(IdTag);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

//	--------------------------------------- RECORDATORIOS -------------------------------------- \\

app.get("/api/reminders-by-user/:userId", async (req, res) => {
	let data = await Con.getReminders(req.params.userId);

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
				eachData.T_Prioridad,
				eachData.B_estado

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
app.post('/api/update-priority-reminder', async (req, res) =>{
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

// Llamado al puerto
app.listen(PORT);

// TO DO

// - Add etiqueta
// - Edit etiqueta
// - Delete etiqueta





