const courseModel = require('./course_model');
const CourseDetailsResponse = require('./course_response');

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_ERROR = 500;


const getCourseDetails = async (req, res) => {
   
    const { id } = req.params;

    if (!id) {
        
        return res.status(HTTP_NOT_FOUND).json({ 
            error: "ID de curso no proporcionado." 
        });
    }

    try {
        // 1. Llamada al Modelo 
        const courseFromDb = await courseModel.findCourseById(id);

        // 2. Validación
        if (!courseFromDb) {
        
            return res.status(HTTP_NOT_FOUND).json({
                error: "El curso no fue encontrado en la base de datos."
            });
        }

        // 3. Formateo de Respuesta 
        const responseObj = new CourseDetailsResponse(courseFromDb);

        // 4. Enviar JSON
        return res.status(HTTP_OK).json(responseObj.toJSON());

    } catch (error) {
    
        console.error("Error en el controlador:", error);
        
        return res.status(HTTP_INTERNAL_ERROR).json({
            error: "Error interno al consultar la base de datos."
        });
    }
};

module.exports = {
    getCourseDetails
};