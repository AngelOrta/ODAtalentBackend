import {Router} from 'express';
import AlumnoController from '../controllers/alumno.controllers.js';
export const router = Router();

// GET /alumnos/postulaciones?id_alumno=
router.get('/postulaciones', AlumnoController.obtenerPostulacionesPorAlumno);

// POST /alumnos/postularse
router.post('/postularse', AlumnoController.postularseAVacante);

// DELETE /alumnos/cancelar_postulacion
router.delete('/cancelar_postulacion', AlumnoController.cancelarPostulacion);

export default router;