const TagUpdateResponse = require('./tag_update_response');

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_INTERNAL_ERROR = 500;

const updateReminderTags = async (req, res) => {

    const { id } = req.params; 
    const { tagIds } = req.body;
    const userId = req.body.userId || 1;

    if (!id) {
        return res.status(HTTP_BAD_REQUEST).json({
            error: "El ID del recordatorio es obligatorio."
        });
    }

    if (!Array.isArray(tagIds)) {
        return res.status(HTTP_BAD_REQUEST).json({
            error: "El formato de tags es inválido. Se requiere una lista (array)."
        });
    }

    try {

        await tagModel.syncTags(id, tagIds);

        await tagModel.logTagChange(userId, id, tagIds.length);

        const responseHandler = new TagUpdateResponse(id, tagIds);

        return res.status(HTTP_OK).json(responseHandler.generate());

    } catch (error) {

        console.error("Error al modificar tags:", error);

        return res.status(HTTP_INTERNAL_ERROR).json({
            error: "Error interno al procesar los tags."
        });
    }
};

module.exports = {
    updateReminderTags
};