class DuplicateReminderResponse {

   
    constructor(newId, data) {
      
        this.id = newId;
        this.title = data.T_nombre;
        this.description = data.T_descripción;
        this.dueDate = data.Dt_fechaVencimiento;
        this.status = "PENDING"; 
        this.isCompleted = false; 
        this.createdAt = new Date();
    }

    
    generate() {
       
        return {
            status: "success",
            message: "Recordatorio duplicado correctamente como Pendiente.",
            data: {
                id: this.id,
                title: this.title,
                description: this.description,
                date: this.dueDate,
                completed: this.isCompleted,
                metadata: {
                    createdFromDuplicate: true,
                    timestamp: this.createdAt
                }
            }
        };
    }
}

module.exports = DuplicateReminderResponse;