import express from "express";
import { Connection } from "../Connection.js";
import { officialAct } from "../OfficialAct.js";
import { hashPassword } from "./funciones_auth.js"

let Con = new Connection();
const router = express.Router();

//  Obtener horario oficial
router.get("/api/official-schedule/:userId", async (req, res) => {
	//	req.params permite obtener los valoeres dados por medio de la URL
	const USER_ID = req.params.userId;
	const TOKEN = req.header('Authorization');
    const CALL = `/schedules/official/users/${USER_ID}`;

	try {
		//Petición a la API de Go
		let data = await Con.goGetFetcher(CALL, TOKEN);

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

//  Obtener los tipos de curso
router.get("/api/course-types", async (req, res) => {
    const TOKEN = req.header('Authorization');
	const CALL = `/course-types`;

	let data = await Con.goGetFetcher(CALL, TOKEN);
	//let data = await Con.GetTiposCurso(TOKEN);

	let tiposCurso = data.map(eachData => {
			if (eachData.B_isDeleted == true) {
				return null;
			}

			return eachData.T_nombre;

		}).filter(tipo => tipo !== null);

	return res.json(tiposCurso);
});

// Obtener los periodos académicos
router.get("/api/academic-periods", async (req, res) => {
    const CALL = `/academic-periods`;
    const TOKEN = req.header('Authorization');

	let data = await Con.goGetFetcher(CALL, TOKEN)//await Con.GetAcademicPeriods();
	data = data.filter(a => a.isDeleted == 0);

	return res.json(data);
});

router.post('/api/import-schedule', async (req, res) =>{
	const NOMBRE = req.body.nombre;
	const SEMESTRE = req.body.semestre;
	const PROGRAMA = req.body.programa;
	const COD_USUARIO = req.body.codUsuario.toString();
	const NRC = req.body.nrc.toString();
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

	const TOKEN = req.header('Authorization');
    const CALL = `/schedules/import`;
	const DATA = {
		nombre: NOMBRE,
		semestre: SEMESTRE,
		programa: PROGRAMA,
		codUsuario: COD_USUARIO,
		nrc: NRC,
		nombreCurso: NOMBRE_CURSO,
		docente: DOCENTE,
		creditos: CREDITOS,
		modoCalificar: MODO_CALIFICAR,
		campus: CAMPUS,
		tipoCurso: TIPO_CURSO,
		dia: DIA,
		horaInicio: HORA_INICIO,
		horaFin: HORA_FIN,
		salon: SALON,
		periodoAcademico: PERIODO_ACADEMICO
	};

	try {
		const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);
	/*
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
		*/

		//Agregar un nuevo usuario
		let temp = NOMBRE;
		const temp2 = COD_USUARIO
		temp = temp.split(" ")[0];
		temp = temp.toLowerCase();
		temp = temp.charAt(0).toUpperCase() +temp.slice(1);
		const PASS = temp + "@" + temp2
		const HASH_PASS = await hashPassword(PASS)
		const CALL2 = "/auth/users"
		const DATA2 = {
			User: temp2,
			Pass: HASH_PASS,
		};
		await Con.goPostFetcher(CALL2, DATA2, TOKEN);
		console.log("CONTINUO?")
		// Datos para obtener id del usuario
		const CALL3 = `/users/${temp2}`;

		// Obtener datos del usuario
		const response = await Con.goGetFetcher(CALL3, TOKEN)
		const USER_DATA = response[0];
		if (!USER_DATA || !USER_DATA.idUsuario) {
            console.log("Respuesta de API sin datos de usuario:", response);
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const USER_ID = USER_DATA.idUsuario.toString();

		// Datos de la paleta
		const CALL4 = `/palette`;
		const DATA4 = {
		userId: USER_ID,
		palette: "default"
		}

		// Guardar paleta
		const RESULT4 = await Con.goPostFetcher(CALL4, DATA4, TOKEN);
		const success4 = RESULT4 !== undefined || RESULT4?.status === 200;

		if (success4) {
			console.log("Paleta guardada correctamente");
		} else {
			console.log("El servidor no respondió con datos");
		}

		// Datos de registro de incorporación
		const CALL5 = `/onboarding/`;
		const DATA5 = {
		userId: USER_ID,
		status: "0" // No ha hecho el tutorial
		}
		
		// Guardar registro de incorporación
		const RESULT5 = await Con.goPostFetcher(CALL5, DATA5, TOKEN);
		const success5 = RESULT5 !== undefined || RESULT5?.status === 200;

		if (success5) {
			console.log("Registro guardado correctamente");
		} else {
			console.log("El servidor no respondió con datos");
		}

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

// Agregar un periodo académico
router.post("/api/academic-periods/insert", async (req, res) => {

	const USER_ID = req.body.idUsuario;
	const NAME = req.body.nombre;
	const DATE_START = req.body.fechaInicio;
	const DATE_END = req.body.fechaFinal;
	const USER_CODE = req.body.codUsuario;

	const BODY = {
		idUsuario: USER_ID,
		nombre: NAME,
		fechaInicio: DATE_START,
		fechaFinal: DATE_END,
		codUsuario: USER_CODE,
	}

    const CALL = `/academic-periods/insert`;
    const TOKEN = req.header('Authorization');

	let RESULT = await Con.goPostFetcher(CALL, BODY, TOKEN)

	return res.json({
		success: RESULT != undefined
	});
});

// Editar un periodo académico
router.post("/api/academic-periods/update", async (req, res) => {

	const USER_ID = req.body.idUsuario;
	const ACADEMIC_PERIOD_ID = req.body.idPeriodoAcademico;
	const NAME = req.body.nombre;
	const DATE_START = req.body.fechaInicio;
	const DATE_END = req.body.fechaFinal;

	const BODY = {
		idUsuario: USER_ID,
		idPeriodo: ACADEMIC_PERIOD_ID,
		nombre: NAME,
		fechaInicio: DATE_START,
		fechaFinal: DATE_END
	}

    const CALL = `/academic-periods/update`;
    const TOKEN = req.header('Authorization');

	let RESULT = await Con.goPostFetcher(CALL, BODY, TOKEN)

	return res.json({
		success: RESULT != undefined
	});
});

// Borrar un periodo académico
router.post("/api/academic-periods/delete", async (req, res) => {

	const USER_ID = req.body.idUsuario;
	const ACADEMIC_PERIOD_ID = req.body.idPeriodoAcademico;

	const BODY = {
		idUsuario: USER_ID,
		idPeriodo: ACADEMIC_PERIOD_ID
	}

    const CALL = `/academic-periods/delete`;
    const TOKEN = req.header('Authorization');

	let RESULT = await Con.goPostFetcher(CALL, BODY, TOKEN)

	return res.json({
		success: RESULT != undefined
	});
});

export default router;
