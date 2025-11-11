import {Router} from 'express';
import AlumnoController from '../controllers/alumno.controllers.js';
export const router = Router();

// GET /alumnos/perfil?id_alumno=
router.get('/perfil', AlumnoController.obtenerPerfilAlumno);

// PUT /alumnos/perfil/actualizar_foto
router.put('/perfil/actualizar_foto', AlumnoController.actualizarFotoPerfilAlumno);

// PUT /alumnos/perfil/actualizar_habilidades
router.put('/perfil/actualizar_habilidades', AlumnoController.actualizarHabilidadesPerfilAlumno);

// PUT /alumnos/perfil/actualizar_descripcion
router.put('/perfil/actualizar_descripcion', AlumnoController.actualizarDescripcionPerfilAlumno);

// PUT /alumnos/perfil/subir_cv
router.put('/perfil/subir_cv', AlumnoController.subirCVAlumno);

// PUT /alumnos/perfil/actualizar_semestre
router.put('/perfil/actualizar_semestre', AlumnoController.actualizarSemestreAlumno);

// PUT /alumnos/perfil/actualizar_ciudad_entidad
router.put('/perfil/actualizar_ciudad_entidad', AlumnoController.actualizarCiudadEntidadAlumno);

// PUT /alumnos/perfil/actualizar_telefono
router.put('/perfil/actualizar_telefono', AlumnoController.actualizarTelefonoAlumno);

// PUT /alumnos/perfil/actualizar_fecha_nacimiento
router.put('/perfil/actualizar_fecha_nacimiento', AlumnoController.actualizarFechaNacimientoAlumno);

// GET /alumnos/postulaciones?id_alumno=
router.get('/postulaciones', AlumnoController.obtenerPostulacionesPorAlumno);

// POST /alumnos/postularse
router.post('/postularse', AlumnoController.postularseAVacante);

// DELETE /alumnos/cancelar_postulacion
router.delete('/cancelar_postulacion', AlumnoController.cancelarPostulacion);

export default router;