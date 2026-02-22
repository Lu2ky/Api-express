class ActivityUpdateResponse {

    
    constructor(dbRow) {

        if (!dbRow) {
            this.id = 0;
            this.title = "";
            this.description = "";
            this.date = new Date();
        } else {
           
            this.id = dbRow.N_idRecordatorio;
            this.title = dbRow.T_nombre;
            this.description = dbRow.T_descripción; 
            this.date = dbRow.Dt_fechaVencimiento;
        }
        
        this.updatedAt = new Date();
    }


    format() {
      
        return {
            status: "success",
            message: "Actividad actualizada correctamente.",
            data: {
         
                activityId: this.id,
                name: this.title,
                details: this.description,
                scheduledFor: this.date,
                lastUpdate: this.updatedAt
            }
        };
    }
}

module.exports = ActivityUpdateResponse;