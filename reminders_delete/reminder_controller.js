const ReminderDeleteResponse = require('./reminder_delete_response');


const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_ERROR = 500;


const deleteReminder = async (req, res) => {
  
    const { id } = req.params;
    
    const userId = req.body.userId || 1; 

    // 1. Validación básica
    if (!id) {
  
        return res.status(HTTP_NOT_FOUND).json({
            error: "ID de recordatorio no proporcionado."
        });
    }

    try {
        // 2. Ejecutar eliminación en DB
        const isDeleted = await reminderModel.deleteReminderById(id);

        if (!isDeleted) {
          
            return res.status(HTTP_NOT_FOUND).json({
                error: "El recordatorio no existe o ya fue eliminado."
            });
        }

        // 3. Registrar auditoría (Logs)
       
        await reminderModel.logDeletion(userId, id);

        // 4. Generar Respuesta (PascalCase)
        const responseHandler = new ReminderDeleteResponse(id);

        // 5. Enviar confirmación
        return res.status(HTTP_OK).json(responseHandler.generate());

    } catch (error) {
       
        console.error("Error crítico al eliminar recordatorio:", error);
        
        return res.status(HTTP_INTERNAL_ERROR).json({
            error: "Error interno del servidor al procesar la eliminación."
        });
    }
};

module.exports = {
    deleteReminder
};