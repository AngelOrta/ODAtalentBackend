import EmpresaController from "../controllers/empresa.controllers.js"; 
import { Router } from "express";
export const router = Router();

// GET /api/empresas/obtenerEmpresas
router.get('/obtener_empresas', EmpresaController.obtenerEmpresas);

// POST /api/empresas/agregarEmpresa
router.post('/agregar_empresa', EmpresaController.agregarEmpresa);

export default router;