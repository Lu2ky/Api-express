class DeletionRequest {

  
    constructor(id, text) {
        this.commentId = id;
        this.previewText = text;
        this.requiresConfirmation = true;
    }

    
    generatePrompt() {
       
        return {
            status: "pending_confirmation",
            message: "Se requiere confirmación del usuario para eliminar permanentemente.",
            action: "delete",
            data: {
                resourceId: this.commentId,
                resourceType: "comentario",
                preview: this.previewText, 
                confirmEndpoint: `/api/comments/delete/${this.commentId}?confirm=true`
            }
        };
    }
}

module.exports = DeletionRequest;