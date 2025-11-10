import {Router} from 'express';
import ReclutadorController from '../controllers/reclutador.controllers.js';

export const router = Router();

// POST /api/reclutadores/crear_vacante
router.post('/crear_vacante', ReclutadorController.crearVacante);

// GET /api/reclutadores/vacantes_publicadas?id_reclutador=
router.get('/vacantes_publicadas', ReclutadorController.obtenerVacantesPublicadas);

//GET /api/reclutadores/postulaciones?id_vacante=
router.get('/postulaciones', ReclutadorController.obtenerPostulacionesVacante);

// PUT /api/reclutadores/editar_vacante
router.put('/editar_vacante', ReclutadorController.editarVacante);

// PUT /api/reclutadores/cambiar_estado_vacante
router.put('/cambiar_estado_vacante', ReclutadorController.cambiarEstadoVacante);

// DELETE /api/reclutadores/borrar_vacante
router.delete('/borrar_vacante', ReclutadorController.borrarVacante);

export default router;