import { Router } from 'express';
import UsuariosController  from '../controllers/usuario.controllers.js';

export const router = Router();

// POST /api/usuarios/registrar
router.post('/registrar', UsuariosController.registrar);

// POST /api/usuarios/encolar_reclutador
router.post('/encolar_reclutador', UsuariosController.encolarReclutador);

// GET /api/usuarios/reclutadores_pendientes
router.get('/reclutadores_pendientes', UsuariosController.verReclutadoresPendientes);

// POST /api/usuarios/aceptar_reclutador
router.post('/aceptar_reclutador', UsuariosController.aceptarReclutador);

// GET /api/usuarios/uid/:uid
router.get('/uid/:uid',  UsuariosController.obtenerUsuarioPorUid);

export default router;
