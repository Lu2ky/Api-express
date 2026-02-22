const SUCCESS_MESSAGE = "El comentario ha sido asociado a la materia correctamente.";
const STATUS_SUCCESS = "success";


class CommentConfirmation {
    
   
    constructor(id, text, course) {
       
        this.commentId = id;
        this.commentText = text;
        this.courseId = course;
        this.timestamp = new Date();
    }

 
    getFormattedResponse() {
       
        return {
            status: STATUS_SUCCESS,
            message: SUCCESS_MESSAGE,
            data: {
                id: this.commentId,
                content: this.commentText,
                course: this.courseId,
                createdAt: this.timestamp
            }
        };
    }
}

//exportación del módulo//
module.exports = CommentConfirmation;