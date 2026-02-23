const DuplicateReminderResponse = require('./duplicate_response');


const HTTP_CREATED = 201;
const HTTP_NOT_FOUND = 404;
const HTTP_INTERNAL_ERROR = 500;
const SUFFIX_COPY = " (Copia)"; 


const duplicateReminder = async (req, res) => {
    
    const { id } = req.params; 
    const userId = req.body.userId || 1; 

    try {
        // 1. Obtener datos del original
        const originalData = await reminderModel.getReminderRaw(id);

        if (!originalData) {
           
            return res.status(HTTP_NOT_FOUND).json({
                error: "El recordatorio original no existe."
            });
        }

        // 2. Preparar datos para la copia
       
        const newTitle = `${originalData.T_nombre}${SUFFIX_COPY}`;
        
        // 3. Crear el nuevo registro
        const newId = await reminderModel.createDuplicateRecord(
            newTitle,
            originalData.T_descripción,
            originalData.Dt_fechaVencimiento
        );

        // 4. Registrar auditoría 
        await reminderModel.logDuplication(userId, id, newId);

        // 5. Preparar objeto para respuesta
        
        const newReminderData = {
            T_nombre: newTitle,
            T_descripción: originalData.T_descripción,
            Dt_fechaVencimiento: originalData.Dt_fechaVencimiento
        };

        // 6. Generar respuesta 
        const responseHandler = new DuplicateReminderResponse(newId, newReminderData);

        return res.status(HTTP_CREATED).json(responseHandler.generate());

    } catch (error) {
      
        console.error("Error al duplicar recordatorio:", error);
        
        return res.status(HTTP_INTERNAL_ERROR).json({
            error: "Error interno del servidor al duplicar la tarea."
        });
    }
};

module.exports = {
    duplicateReminder
};