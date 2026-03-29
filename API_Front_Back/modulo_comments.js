import express from "express";
import { Connection } from "../Connection.js";

let Con = new Connection();
const router = express.Router();

//	Sacar los comentarios
router.get("/api/get-personal-comments/:idUser", async (req, res) => {
	const ID_USER = req.params.idUser;
    const TOKEN = req.header('Authorization');
    const CALL = `/comments/personal/users/${ID_USER}`;

	try {
        const RESULT = await Con.goGetFetcher(CALL, TOKEN);
		//const RESULT = await Con.GetPersonalComments(ID_USER);

		let comentarios = RESULT.map(eachData => {

			return eachData.B_isDeleted.Bool ? null : eachData;
		}).filter(comment => comment != null);

		return res.status(200).json({
			success: true,
			data: comentarios
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

//	Sacar los comentarios por curso
router.get("/api/get-personal-course-comments/:idUser/:idCourse", async (req, res) => {
	const ID_USER = req.params.idUser;
	const ID_COURSE = req.params.idCourse;

    const TOKEN = req.header('Authorization');
    const CALL = `/comments/personal/users/${ID_USER}/courses/${ID_COURSE}`;

	try {
        const RESULT = await Con.goGetFetcher(CALL, TOKEN);
		//const RESULT = await Con.GetPersonalCourseComments(ID_USER, ID_COURSE);

		let comentarios = RESULT.map(eachData => {

			return eachData.B_isDeleted.Bool ? null : eachData;
		}).filter(comment => comment != null);

		return res.status(200).json({
			success: RESULT != undefined,
			data: comentarios
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});

//	Agregar comentario
router.post("/api/add-comment", async (req, res) => {
	const N_ID_HORARIO = req.body.N_idHorario;
	const T_COMENTARIO = req.body.T_comentario;

    const TOKEN = req.header('Authorization');
    const CALL = `/comments/personal`;

	try {
        const DATA = {
            N_idHorario: N_ID_HORARIO,
			T_comentario: T_COMENTARIO
        }

        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN)
		/*const RESULT = await Con.addPersonalComment(
			N_ID_HORARIO,
			T_COMENTARIO
		);*/

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

//  Actaulizar comentario
router.post("/api/update-comment", async (req, res) => {
	const ID = req.body.N_idComentarios;
	const NEW_COMMENT = req.body.T_comentario;

    const TOKEN = req.header('Authorization');
    const CALL = `/comments/personal/update`;

	try {
		if (!ID || !NEW_COMMENT) {
			return res.status(400).json({
				error: "Faltan datos obligatorios"
			});
		}

        const DATA = {
            N_idComentarios: ID,
			T_comentario: NEW_COMMENT
        }

        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);

		//const RESULT = await Con.updatePersonalComment(ID, NEW_COMMENT);

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

//  Quitar comentario
router.post("/api/remove-comment", async (req, res) => {
	const ID = req.body.N_idComentarios;
    const TOKEN = req.header('Authorization');
    const CALL = `/comments/personal/delete`;

	try {
		
        const DATA = {
            N_idComentarios: ID
        }
		
        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN)

        //const RESULT = await Con.deletePersonalComment(ID);

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

export default router;