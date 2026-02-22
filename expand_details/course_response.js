class CourseDetailsResponse {

   
    constructor(dbRow) {
        
        this.id = dbRow.T_idCurso;
        this.name = dbRow.T_nombre;
        this.teacher = dbRow.T_docente;
        this.credits = dbRow.N_creditos;
        this.grading = dbRow.T_modoCalificar;
        this.location = {
            campus: dbRow.T_campus,
            room: dbRow.T_salon
        };
        this.description = dbRow.T_descripcion;
    }

    
    toJSON() {
        return {
            status: "success",
            data: {
                courseId: this.id,
                title: this.name,
                instructor: this.teacher,
                academicInfo: {
                    credits: this.credits,
                    gradingMode: this.grading
                },
                location: this.location,
                description: this.description
            }
        };
    }
}

module.exports = CourseDetailsResponse;