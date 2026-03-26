import express from "express";
import { Connection } from "../Connection.js";
import { officialAct } from "../OfficialAct.js";

let Con = new Connection();
const router = express.Router();

//  Obtener horario oficial
router.get("/api/official-schedule/:userId", async (req, res) => {
	//	req.params permite obtener los valoeres dados por medio de la URL
	const USER_ID = req.params.userId;
	const TOKEN = req.header('Authorization');
    const CALL = `/GetOfficialScheduleByUserId/${USER_ID}`;

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
	let data = await Con.GetTiposCurso(TOKEN);

	let tiposCurso = data
		.map(eachData => {
			if (eachData.B_isDeleted == true) {
				return null;
			}

			return eachData.T_nombre;
		})
		.filter(tipo => tipo !== null);

	return res.json(tiposCurso);
});

// Obtener los periodos académicos
router.get("/api/academic-periods", async (req, res) => {
    const CALL = `/GetTiposCurso`;
    const TOKEN = req.header('Authorization');

	let data = await Con.goGetFetcher(CALL, TOKEN)//await Con.GetAcademicPeriods();

	console.log(data)

	return res.json(data);
});

export default router;