const express = require("express");
const router = express.Router();


const commentController = require("./comment_controller");



// agregar comentario a materia//
router.post("/add", commentController.addCommentToCourse);



// editar comentario existente//


router.put("/edit/:id", commentController.updateComment);


module.exports = router;
