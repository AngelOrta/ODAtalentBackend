import {Router} from 'express';
import VacanteController from '../controllers/vacante.controllers.js';

export const router = Router();

//GET /api/vacantes/detalles?id_vacante=
router.get('/detalles', VacanteController.obtenerDetallesVacante);

export default router;