import EmpresaController from "../controllers/empresa.controllers.js"; 
import { Router } from "express";
export const router = Router();

// GET /api/empresas/obtenerEmpresas
router.get('/obtener_empresas', EmpresaController.obtenerEmpresas);

// POST /api/empresas/agregarEmpresa
router.post('/agregar_empresa', EmpresaController.agregarEmpresa);

// PUT /api/empresas/actualizarEmpresa
router.put('/actualizar_empresa', EmpresaController.actualizarEmpresa);

// DELETE /api/empresas/eliminarEmpresa
router.delete('/eliminar_empresa', EmpresaController.eliminarEmpresa);

export default router;