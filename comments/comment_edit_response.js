
class CommentEditResponse {

  
    constructor(id, newText) {
       
        this.commentId = id;
        this.updatedContent = newText;
        this.updatedAt = new Date();
    }

   
    formatResponse() {
   
        return {
            "status": "success",
            "message": "El comentario ha sido actualizado correctamente.",
            "data": {
                "id": this.commentId,
                "content": this.updatedContent,
                "lastModified": this.updatedAt
            }
        };
    }
}

module.exports = CommentEditResponse;