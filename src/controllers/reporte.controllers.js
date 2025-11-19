import Reporte from "../models/reporte.models.js";
export default class ReporteController {
    static async verReportes(req, res) {
        try {
            let { estado } = req.query;
            let { page, limit } = req.query;
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const offset = (page - 1) * limit;
            if (!estado) estado = null;
            const reportes = await Reporte.verReportes(estado, page, offset, limit);
            if (!reportes) {
                return res.status(404).json({ message: 'No se encontraron reportes' });
            }
            res.status(200).json(reportes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async eliminarPublicacion(req, res) {
        try {
            const { id_publicacion, id_reporte } = req.body;
            if (!id_publicacion || !id_reporte) {
                return res.status(400).json({ message: 'Faltan datos necesarios' });
            }
            const resultado = await Reporte.eliminarPublicacion(id_publicacion, id_reporte);
            if (!resultado) {
                return res.status(404).json({ message: 'No se encontró la publicación o el reporte' });
            }
            res.status(200).json({ message: 'Publicación eliminada y reporte resuelto correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async eliminarComentario(req, res) {
        try {
            const { id_comentario, id_reporte } = req.body;
            if (!id_comentario || !id_reporte) {
                return res.status(400).json({ message: 'Faltan datos necesarios' });
            }
            const resultado = await Reporte.eliminarComentario(id_comentario, id_reporte);
            if (!resultado) {
                return res.status(404).json({ message: 'No se encontró el comentario o el reporte' });
            }
            res.status(200).json({ message: 'Comentario eliminado y reporte resuelto correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async eliminarVacante(req, res) {
        try {
            const { id_vacante, id_reporte } = req.body;
            if (!id_vacante || !id_reporte) {
                return res.status(400).json({ message: 'Faltan datos necesarios' });
            }
            const resultado = await Reporte.eliminarVacante(id_vacante, id_reporte);
            if (!resultado) {
                return res.status(404).json({ message: 'No se encontró la vacante o el reporte' });
            }
            res.status(200).json({ message: 'Vacante eliminada y reporte resuelto correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async resolverReporte(req, res) {
        try {
            let { id_reporte} = req.body;
            if (!id_reporte) {  
                return res.status(400).json({ message: 'Faltan datos necesarios' });
            }
            const resultado = await Reporte.resolverReporte(id_reporte);
            if (!resultado) {
                return res.status(404).json({ message: 'No se encontró el reporte' });
            }
            res.status(200).json({ message: 'Reporte resuelto correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

}