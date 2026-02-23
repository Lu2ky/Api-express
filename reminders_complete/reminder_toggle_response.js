class ReminderToggleResponse {

   
    constructor(id, status) {
        this.reminderId = id;
        this.isCompleted = status;
        this.updatedAt = new Date();
    }

  
    format() {
      
        return {
            status: "success",
            message: this.isCompleted ? "Tarea marcada como completada." : "Tarea marcada como pendiente.",
            data: {
                id: this.reminderId,
                completed: this.isCompleted, 
                timestamp: this.updatedAt
            }
        };
    }
}

module.exports = ReminderToggleResponse;