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

// POST /api/usuarios/rechazar_reclutador
router.post('/rechazar_reclutador', UsuariosController.rechazarReclutador);

// GET /api/usuarios/uid/:uid
router.get('/uid/:uid',  UsuariosController.obtenerUsuarioPorUid);

//POST /api/usuarios/crear_reclutador
router.post('/crear_reclutador', UsuariosController.crearReclutador);

//POST /api/usuarios/crear_alumno
router.post('/crear_alumno', UsuariosController.crearAlumno);


export default router;
