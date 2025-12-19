import Vacante from '../models/vacante.models.js';
import normalizarObjetosUndefinedANull from '../helpers/normalizarObjetos.helper.js';

export default class VacanteController {
    // Aquí irán los métodos relacionados con las vacantes
    static async obtenerDetallesVacante(req, res) {
        try {
            let { id_vacante , id_alumno, id_reclutador} = req.query;

            if (!id_vacante && (!id_alumno || !id_reclutador)) {
                return res.status(400).json({ message: 'Falta el id_vacante' });
            }
            if(!id_alumno ) id_alumno = null;
            if(!id_reclutador ) id_reclutador = null;
            if(id_alumno && id_reclutador){
                return res.status(400).json({ message: 'Proporcione solo id_alumno o id_reclutador, no ambos' });
            }

            const vacante = await Vacante.obtenerDetallesVacante(id_vacante, id_alumno, id_reclutador);
            if (!vacante) {
                return res.status(404).json({ message: 'Vacante no encontrada' });
            }
            res.status(200).json(vacante);
        } catch (error) {
            console.error(error.message);   
            res.status(500).json({ message: error.message });
        }
    }

    static async buscarVacantes(req, res) {
        try {
            const { id_alumno,query, ciudad, entidad, modalidad, rol_trabajo, ordenar_por } = req.query;
            let busquedaData = normalizarObjetosUndefinedANull({ id_alumno,query, ciudad, entidad, modalidad, rol_trabajo, ordenar_por });
            let { page, limit } = req.query;
            const uid_admin = req.uid;
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            const offset = (page - 1) * limit;
            if( !id_alumno){
                return res.status(400).json({ message: 'Falta el id del alumno' });
            }
            let modalidadesArray = null;
            let rolesArray = null;
            if(busquedaData.modalidad){if (Array.isArray(busquedaData.modalidad)) {
                    modalidadesArray = busquedaData.modalidad;
                } else {
                    modalidadesArray = busquedaData.modalidad.split(',');
                }
                modalidadesArray = modalidadesArray
                .map(m => m.trim())
                .filter(m => m !== '');
                busquedaData.modalidad = modalidadesArray.length > 0 ? modalidadesArray : null;
            }
            if(busquedaData.rol_trabajo){if (Array.isArray(busquedaData.rol_trabajo)) {
                    rolesArray = busquedaData.rol_trabajo;
                } else {
                    rolesArray = busquedaData.rol_trabajo.split(',');
                }
                rolesArray = rolesArray
                .map(r => r.trim())
                .filter(r => r !== '');
                busquedaData.rol_trabajo = rolesArray.length > 0 ? rolesArray : null;
            }
            const resultados = await Vacante.buscarVacantes(busquedaData, page, offset, limit, uid_admin);
            res.status(200).json(resultados);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
    }
}