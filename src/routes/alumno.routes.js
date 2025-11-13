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

// POST /alumnos/escolaridad/agregar
router.post('/escolaridad/agregar', AlumnoController.agregarEscolaridadAlumno);

// PUT /alumnos/escolaridad/actualizar
router.put('/escolaridad/actualizar', AlumnoController.actualizarEscolaridadAlumno);

// DELETE /alumnos/escolaridad/eliminar
router.delete('/escolaridad/eliminar', AlumnoController.eliminarEscolaridadAlumno);

// POST /alumnos/url_externa/agregar
router.post('/url_externa/agregar', AlumnoController.agregarUrlExternaAlumno);

// PUT /alumnos/url_externa/actualizar
router.put('/url_externa/actualizar', AlumnoController.actualizarUrlExternaAlumno);

// DELETE /alumnos/url_externa/eliminar
router.delete('/url_externa/eliminar', AlumnoController.eliminarUrlExternaAlumno);

// POST /alumnos/curso/agregar
router.post('/curso/agregar', AlumnoController.agregarCursoAlumno);

// PUT /alumnos/curso/actualizar
router.put('/curso/actualizar', AlumnoController.actualizarCursoAlumno);

// DELETE /alumnos/curso/eliminar
router.delete('/curso/eliminar', AlumnoController.eliminarCursoAlumno);

// POST /alumnos/certificado/agregar
router.post('/certificado/agregar', AlumnoController.agregarCertificadoAlumno);

// PUT /alumnos/certificado/actualizar
router.put('/certificado/actualizar', AlumnoController.actualizarCertificadoAlumno);

// DELETE /alumnos/certificado/eliminar
router.delete('/certificado/eliminar', AlumnoController.eliminarCertificadoAlumno);

// POST /alumnos/experiencia/agregar
router.post('/experiencia/agregar', AlumnoController.agregarExperienciaLaboralAlumno);

// PUT /alumnos/experiencia/actualizar
router.put('/experiencia/actualizar', AlumnoController.actualizarExperienciaLaboralAlumno);

// DELETE /alumnos/experiencia/eliminar  
router.delete('/experiencia/eliminar', AlumnoController.eliminarExperienciaLaboralAlumno);

// DELETE /alumnos/perfil/eliminar_cuenta    (anonimizar)
router.delete('/perfil/eliminar_cuenta', AlumnoController.eliminarCuentaAlumno);

// GET /alumnos/perfil/vista_reclutador?id_alumno=
router.get('/perfil/vista_reclutador', AlumnoController.obtenerPerfilAlumnoVistaReclutador);

// GET /alumnos/perfil/publico?id_alumno=
router.get('/perfil/publico', AlumnoController.obtenerPerfilPublicoAlumno); 

// GET /alumnos/postulaciones?id_alumno=
router.get('/postulaciones', AlumnoController.obtenerPostulacionesPorAlumno);

// POST /alumnos/postularse
router.post('/postularse', AlumnoController.postularseAVacante);

// DELETE /alumnos/cancelar_postulacion
router.delete('/cancelar_postulacion', AlumnoController.cancelarPostulacion);

// GET /alumnos/historial_busquedas?id_alumno=
router.get('/historial_busquedas', AlumnoController.obtenerHistorialBusquedas);

// DELETE /alumnos/limpiar_historial
router.delete('/limpiar_historial', AlumnoController.limpiarHistorialBusquedas);

// DELETE /alumnos/borrar_busqueda
router.delete('/borrar_busqueda', AlumnoController.borrarBusquedaPorId);

export default router;