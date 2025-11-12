import Vacante from '../models/vacante.models.js';
import normalizarObjetosUndefinedANull from '../helpers/normalizarObjetos.helper.js';

export default class VacanteController {
    // Aquí irán los métodos relacionados con las vacantes
    static async obtenerDetallesVacante(req, res) {
        const { id_vacante } = req.query;
        try {
            if (!id_vacante) {
                return res.status(400).json({ message: 'Falta el id_vacante' });
            }
            const vacante = await Vacante.obtenerDetallesVacante(id_vacante);
            if (!vacante) {
                return res.status(404).json({ message: 'Vacante no encontrada' });
            }
            res.status(200).json(vacante);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async buscarVacantes(req, res) {
        const { query, ciudad, entidad, modalidad, roltrabajo, ordenar_por } = req.query;
        const busquedaData = normalizarObjetosUndefinedANull({ query, ciudad, entidad, modalidad, roltrabajo, ordenar_por });
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;
        try {
            if(!query){
                return res.status(400).json({ message: 'Falta el query de búsqueda' });
            }
            const resultados = await Vacante.buscarVacantes(busquedaData, page, offset, limit);
            res.status(200).json(resultados);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
    }
}