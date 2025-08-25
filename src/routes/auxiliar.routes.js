import { Router } from 'express';
import AuxiliarController from '../controllers/auxiliar.controllers.js';
export const router = Router();

router.get('/verificarqr',AuxiliarController.verificarQR);

export default router;