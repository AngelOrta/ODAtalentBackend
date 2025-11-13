import {Router} from 'express';
import ReporteController from '../controllers/reporte.controllers.js';
export const router = Router();

// GET /api/reportes/ver_reportes?estado=pendiente&page=1&limit=10
router.get('/ver_reportes', ReporteController.verReportes);

// DELETE /api/reportes/eliminar_publicacion
router.delete('/eliminar_publicacion', ReporteController.eliminarPublicacion);

// DELETE /api/reportes/eliminar_comentario
router.delete('/eliminar_comentario', ReporteController.eliminarComentario);

// DELETE /api/reportes/eliminar_vacante
router.delete('/eliminar_vacante', ReporteController.eliminarVacante);

// PUT /api/reportes/resolver_reporte
router.put('/resolver_reporte', ReporteController.resolverReporte);

export default router;