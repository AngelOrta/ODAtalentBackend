import { Router } from "express";
import PublicacionController from "../controllers/experiencia.controllers.js";   
export const router = Router();

// POST /api/experiencias_alumnos/crear_experiencia
router.post('/crear_experiencia', PublicacionController.crearPublicacion);

// GET /api/experiencias_alumnos?id_alumno=1page=1&limit=10
router.get('/ver', PublicacionController.obtenerExperienciasAlumnos);

// DELETE /api/experiencias_alumnos/borrar/:id_publicacion
router.delete('/borrar/:id_publicacion', PublicacionController.borrarExperiencia);

// POST /api/experiencias_alumnos/reaccionar
router.post('/reaccionar', PublicacionController.reaccionarExperiencia);

// POST /api/experiencias_alumnos/reaccionar/comentario
router.post('/reaccionar/comentario', PublicacionController.reaccionarComentarioExperiencia);

// POST /api/experiencias_alumnos/comentar
router.post('/comentar', PublicacionController.comentarExperiencia);

// DELETE /api/experiencias_alumnos/comentarios/borrar/:id_comentario
router.delete('/comentarios/borrar/:id_comentario', PublicacionController.borrarComentarioExperiencia);

// GET /api/experiencias_alumnos/comentarios?id_alumno=1&id_publicacion=1
router.get('/comentarios', PublicacionController.obtenerComentariosExperiencia);

// GET /api/experiencias_alumnos/comentarios/respuestas?id_alumno=1&id_comentario_padre=1
router.get('/comentarios/respuestas', PublicacionController.obtenerRespuestasComentarioExperiencia);

// POST /api/experiencias_alumnos/reportar_contenido
router.post('/reportar_contenido', PublicacionController.reportarContenido);

export default router;