import { Router } from "express";
import RolTrabajoController from "../controllers/rolTrabajo.controllers.js";

export const router = Router();

router.get("/ver", RolTrabajoController.obtenerTodos);
router.post("/crear", RolTrabajoController.crear);
router.put("/actualizar", RolTrabajoController.actualizar);
router.delete("/borrar", RolTrabajoController.eliminar);

export default router;
