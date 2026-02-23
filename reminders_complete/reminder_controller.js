const ReminderToggleResponse = require('./reminder_toggle_response');


const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_INTERNAL_ERROR = 500;


const toggleTaskCompletion = async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body; 
    
    
    const userId = req.body.userId || 1; 

    // 1. Validaciones
    if (!id) {
       
        return res.status(HTTP_BAD_REQUEST).json({
            error: "El identificador del recordatorio es obligatorio."
        });
    }


    if (typeof completed !== 'boolean') {
        return res.status(HTTP_BAD_REQUEST).json({
            error: "El estado debe ser un valor booleano (true/false)."
        });
    }

    try {
        // 2. Ejecutar actualización en BD
        const wasUpdated = await reminderModel.updateReminderStatus(id, completed);

        if (!wasUpdated) {
           
            return res.status(HTTP_BAD_REQUEST).json({
                error: "No se encontró el recordatorio o no hubo cambios."
            });
        }

        // 3. Registrar en Logs (Requisito implícito de auditoría)
        const actionString = completed ? "COMPLETADO" : "PENDIENTE";
        await reminderModel.logReminderChange(userId, id, actionString);

        // 4. Generar Respuesta 

        const responseHandler = new ReminderToggleResponse(id, completed);

        return res.status(HTTP_OK).json(responseHandler.format());

    } catch (error) {
       
        console.error("Error al cambiar estado de la tarea:", error);
        
        return res.status(HTTP_INTERNAL_ERROR).json({
            error: "Error interno al procesar la solicitud."
        });
    }
};

module.exports = {
    toggleTaskCompletion
};