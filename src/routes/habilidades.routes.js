import HabilidadesController from "../controllers/habilidades.controllers.js";
import { Router } from "express";

export const router = Router();

//GET /habilidades/disponibles?tipo=Blandas|Técnicas|Idioma
router.get('/disponibles', HabilidadesController.obtenerHabilidades);

export default router;