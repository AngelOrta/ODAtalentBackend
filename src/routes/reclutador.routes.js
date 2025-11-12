import {Router} from 'express';
import ReclutadorController from '../controllers/reclutador.controllers.js';

export const router = Router();

// POST /api/reclutadores/crear_vacante
router.post('/crear_vacante', ReclutadorController.crearVacante);

// GET /api/reclutadores/vacantes_publicadas?id_reclutador=
router.get('/vacantes_publicadas', ReclutadorController.obtenerVacantesPublicadas);

//GET /api/reclutadores/postulaciones?id_vacante=
router.get('/postulaciones', ReclutadorController.obtenerPostulacionesVacante);

// GET /api/reclutadores/postulaciones_revision?id_alumno=1&id_reclutador=2
router.get('/postulaciones_revision', ReclutadorController.obtenerPostulacionesEnRevisionPorIdAlumno);

// PUT /api/reclutadores/reclutar
router.put('/reclutar', ReclutadorController.reclutarAlumno);

// PUT /api/reclutadores/rechazar_postulacion
router.put('/rechazar_postulacion', ReclutadorController.rechazarPostulacionAlumno);

// GET /api/reclutadores/perfil?id_reclutador=
router.get('/perfil', ReclutadorController.obtenerPerfilReclutador);

// PUT /api/reclutadores/perfil/actualizar_foto
router.put('/perfil/actualizar_foto', ReclutadorController.actualizarFotoPerfil);

// PUT /api/reclutadores/editar_vacante
router.put('/editar_vacante', ReclutadorController.editarVacante);

// PUT /api/reclutadores/cambiar_estado_vacante
router.put('/cambiar_estado_vacante', ReclutadorController.cambiarEstadoVacante);

// DELETE /api/reclutadores/borrar_vacante
router.delete('/borrar_vacante', ReclutadorController.borrarVacante);

export default router;