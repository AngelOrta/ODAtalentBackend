import { Router } from 'express';
import UsuariosController  from '../controllers/usuarios.controllers.js';

export const router = Router();

// GET /api/usuarios/uid
router.get('/:uid',  UsuariosController.obtenerUsuarioPorUid);

// POST /api/usuarios/registrar
router.post('/registrar', UsuariosController.registrar);

export default router;
