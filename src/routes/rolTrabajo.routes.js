import { Router } from "express";
import RolTrabajoController from "../controllers/rolTrabajo.controllers.js";

export const router = Router();

router.get("/ver", RolTrabajoController.obtenerTodos);
router.post("/crear", RolTrabajoController.crear);
router.put("/actualizar", RolTrabajoController.actualizar);
router.delete("/borrar", RolTrabajoController.eliminar);
//  POST /api/roles_trabajo/publicar_articulo
router.post("/publicar_articulo", RolTrabajoController.publicarArticulo);
// PUT /api/roles_trabajo/editar_articulo
router.put("/editar_articulo", RolTrabajoController.editarArticulo);
// DELETE /api/roles_trabajo/borrar_articulo
router.delete("/borrar_articulo", RolTrabajoController.borrarArticulo);
// GET /api/roles_trabajo/articulos/:id
router.get("/articulos/:id", RolTrabajoController.obtenerArticuloPorId);

export default router;
