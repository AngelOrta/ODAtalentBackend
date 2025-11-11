import Vacante from '../models/vacante.models.js';

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
}