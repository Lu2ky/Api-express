import express from "express";
import { Connection } from "../Connection.js";
import { PersonalAct } from "../PersonalAct.js";

let Con = new Connection();
const router = express.Router();

//  Obtener horario personal
router.get("/api/personal-schedule/:userId", async (req, res) => {

    const USER_ID = req.params.userId;
    const TOKEN = req.header('Authorization');
    const CALL = `/schedules/personal/users/${USER_ID}`;

	let data = await Con.goGetFetcher(CALL, TOKEN);//await Con.GetPersonalScheduleByUserId(req.params.userId);

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
				eachData.Dt_End.String,
				eachData,
				1
			);

			return PersonalActivity.getData();
		})
		.filter(activity => activity !== null);

	return res.json(PersonalActivitys);
});

//  Agregar actividad personal
router.post("/api/add-personal-activity", async (req, res) => {
	/*
        data = {
            id_user
            id_academic_per
            subject_name
            description
            date_start
            date_end
            start_hour
            end_hour
            day

            TIMES es un arreglo que contiene la información del tiempo de todas
            las actividades de un día concreto y tiene la siguiente estructura
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
	const USER_CODE = req.body.codUsuario;

    const TOKEN = req.header('Authorization');

	const TIMES_CALL = `/schedules/activities/times`;
	const TIMES_BODY = {
		idUsuario: ID_USER,
		dia: DAY
	}

	let TIMES = await Con.goPostFetcher(TIMES_CALL, TIMES_BODY, TOKEN)
	//let TIMES = await Con.GetTimesData(ID_USER, DAY)
	
    //Si no hay actividades, entonces lo ignora.
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
        const CALL = "/schedules/personal"

        const DATA = {
			P_usuario: ID_USER,
			P_nombreCurso: NAME,
			P_descripcion: DESC,
			P_fechaInicio: STA_DATE,
			P_fechaFin: END_DATE,
			P_dia: DAY,
			P_horaInicio: STA_HOUR,
			P_horaFin: END_HOUR,
			P_periodo: ID_ACADEMIC_PER,
			codUsuario: USER_CODE
		};

        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);

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

//	Actualizar actividad personal
router.post("/api/update-personal-activity", async (req, res) => {
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
	const USER_CODE = req.body.codUsuario;

    const TOKEN = req.header('Authorization');

	const TIMES_CALL = `/schedules/activities/times`;
	const TIMES_BODY = {
		idUsuario: ID_USER,
		dia: DAY
	}

	let TIMES = await Con.goPostFetcher(TIMES_CALL, TIMES_BODY, TOKEN)
	//let TIMES = await Con.GetTimesData(ID_USER, DAY)
	
	//Si no hay actividades, entonces lo ignora.
	if (TIMES !== null){
		TIMES = TIMES.map(element =>{

			return element.IsDeleted ? null : [element.idcourse, element.StartHour, element.EndHour, element.FechaInicio, element.FechaFinal]
		}).filter(e => e !== null);
	}

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

        const CALL = "/schedules/personal/update"

        const DATA = {
			P_idCurso: ID_CURSO,
			P_nombreCurso: NAME,
			P_descripcion: DESC,
			P_fechaInicio: STA_DATE,
			P_fechaFin: END_DATE,
			P_horaInicio: STA_HOUR,
			P_horaFin: END_HOUR,
            P_dia: DAY,
			codUsuario: USER_CODE
		};

        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);
/*
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
*/
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

// Eliminar actividad personal
router.post("/api/remove-personal-activity", async (req, res) => {
    /*
        data = {
            IdPersonalSchedule: [ID]
        }
    */
	const ID = req.body.IdPersonalSchedule;
	const USER_CODE = req.body.codUsuario;

    const TOKEN = req.header('Authorization');
    const CALL = `/schedules/personal/delete-or-recover`;

	try {
        const DATA = {
            IdPersonalSchedule: ID,
			codUsuario: USER_CODE
        }

        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN)

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