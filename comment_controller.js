const CommentConfirmation = require("./comment_confirmation");
const CommentEditResponse = require("./comments/comment_edit_response");

const MAX_COMMENT_LENGTH = 255;

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_ERROR = 500;


//1. Asociar comentario a materia//

const addCommentToCourse = async (req, res) => {
    const { courseId, commentText } = req.body;

    
    if (!courseId || !commentText) {
        return res.status(HTTP_BAD_REQUEST).json({ 
            error: "El ID del curso y el texto del comentario son obligatorios." 
        });
    }

    if (commentText.length > MAX_COMMENT_LENGTH) {
        return res.status(HTTP_BAD_REQUEST).json({
            error: "El comentario excede la longitud permitida."
        });
    }

    try {
       
        const newCommentId = Math.floor(Math.random() * 1000);

        return res.status(HTTP_CREATED).json({
            success: true,
            message: "Comentario asociado correctamente",
            data: {
                idComment: newCommentId,
                text: commentText,
                courseId: courseId
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(HTTP_INTERNAL_ERROR).json({
            error: "Error al guardar comentario"
        });
    }
};


//2. Mostrar confirmacion de agregacion//
const sendCommentConfirmation = async (req, res) => {
    const { courseId, commentText } = req.body;

    try {
        const dbResult = {
            N_idComentarios: Math.floor(Math.random() * 1000),
            T_Comentario: commentText,
            T_idCurso: courseId
        };

        const confirmationObject = new CommentConfirmation(
            dbResult.N_idComentarios,
            dbResult.T_Comentario,
            dbResult.T_idCurso
        );

        const responseJson = confirmationObject.getFormattedResponse();

        return res.status(HTTP_OK).json(responseJson);

    } catch (error) {
        console.error(error);
        return res.status(HTTP_INTERNAL_ERROR).json({
            status: "error",
            message: "No se pudo confirmar el comentario"
        });
    }
};


//3. Confirmacion editar comentario//

const sendEditConfirmation = async (req, res) => {

    const { id, newText } = req.body;

    try {

    
        const responseObj = new CommentEditResponse(id, newText);

        console.log("mostrando confirmacion de edicion:", id);

        return res.status(HTTP_OK).json(
            responseObj.formatResponse()
        );

    } catch (error) {
        console.error(error);

        return res.status(HTTP_INTERNAL_ERROR).json({
            error: "no se pudo mostrar confirmacion de edicion"
        });
    }
};

//4. confirmar delete//

 const DeletionRequest = require('./comments/deletion_request');



const requestDeleteConfirmation = async (req, res) => {

    const { id } = req.params;

    try {

        const commentFound = {
            N_idComentarios: id,
            T_Comentario: "Recordar traer calculadora científica.",
            T_idCurso: "MAT-101"
        };

        if (!commentFound) {
            return res.status(HTTP_NOT_FOUND).json({
                error: "El comentario no existe."
            });
        }

        const confirmationPrompt = new DeletionRequest(
            commentFound.N_idComentarios,
            commentFound.T_Comentario
        );

        console.log("Solicitando confirmación para eliminar:", id);

        return res.status(HTTP_OK).json(
            confirmationPrompt.generatePrompt()
        );

    } catch (error) {
        console.error(error);

        return res.status(HTTP_INTERNAL_ERROR).json({
            error: "Error al solicitar confirmación."
        });
    }
};



//exportaciones//
module.exports = {
    addCommentToCourse,
    sendCommentConfirmation,
   sendEditConfirmation,
   requestDeleteConfirmation
};
