import {Router} from 'express';
import ReclutadorController from '../controllers/reclutador.controllers.js';

export const router = Router();

// POST /api/reclutadores/crear_vacante
router.post('/crear_vacante', ReclutadorController.crearVacante);

// PUT /api/reclutadores/actualizar_vacante/:id
router.put('/actualizar_vacante', ReclutadorController.actualizarVacante);

// DELETE /api/reclutadores/borrar_vacante
router.delete('/borrar_vacante', ReclutadorController.borrarVacante);

export default router;