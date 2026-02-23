class ReminderDeleteResponse {

    constructor(deletedId) {
       
        this.deletedId = deletedId;
        this.timestamp = new Date();
    }

    
    generate() {
        
        return {
            status: "success",
            message: "El recordatorio ha sido eliminado correctamente.",
            data: {
                resourceId: this.deletedId,
                action: "DELETE",
                processedAt: this.timestamp
            }
        };
    }
}

module.exports = ReminderDeleteResponse;