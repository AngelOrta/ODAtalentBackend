import {Router} from 'express';
import VacanteController from '../controllers/vacante.controllers.js';

export const router = Router();

//GET /api/vacantes/detalles?id_vacante=
router.get('/detalles', VacanteController.obtenerDetallesVacante);

//GET /api/vacantes/buscar?query=queryString&FILTROSOPCIONALES&ordenar_por=campo_asc|desc&page=1&limit=10
//El queryString se busca en el titulo y descripcion de la vacante
//Si no se incluye queryString, se devuelven todas las vacantes con los filtros aplicados
//filtros opcionales:
//ciudad=ciudad
//entidad=entidad
//modalidad=presencial|remoto|hibrido
//roltrabajo=id_roltrabajo1,id_roltrabajo2
router.get('/buscar', VacanteController.buscarVacantes);

export default router;