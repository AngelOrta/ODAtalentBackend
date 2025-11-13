import Habilidad from '../models/habilidades.models.js';

export default class HabilidadesController {

    static async obtenerHabilidades(req, res) {
        try{
            const { tipo } = req.query;
            const habilidades = await Habilidad.obtenerHabilidades(tipo);
            if (!habilidades) {
                return res.status(404).json({ message: 'No se encontraron habilidades' });
            }
            return res.status(200).json(habilidades);
        }catch(error){
            console.error('Error al obtener habilidades:', error.message);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
        
    }
}