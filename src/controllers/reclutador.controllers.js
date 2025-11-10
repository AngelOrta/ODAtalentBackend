import Reclutador from '../models/reclutador.models.js';
import normalizarObjetosUndefinedANull from '../helpers/normalizarObjetos.helper.js';

export default class ReclutadorController {
    static async crearVacante(req, res) {
        const { id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio, fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad, codigo_postal, modalidad, fecha_limite, escolaridad, conocimientos, habilidades, observaciones, numero_vacantes, roles_relacionados } = req.body;
        const vacanteData = normalizarObjetosUndefinedANull({
            id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio,
            fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad,
            codigo_postal, modalidad, fecha_limite, escolaridad, conocimientos,
            habilidades, observaciones, numero_vacantes, roles_relacionados
        });
        try {
            if (!id_reclutador || !titulo || !descripcion || !duracion || !monto_beca || !horario || !ubicacion || !ciudad || !entidad || !codigo_postal || !modalidad || !escolaridad || !conocimientos || !habilidades || !numero_vacantes) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }
            const idNuevaVacante = await Reclutador.crearVacante(vacanteData);
            res.status(201).json({message: 'Vacante creada exitosamente', id_vacante: idNuevaVacante});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async editarVacante(req, res) {
        const { id_vacante,id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio, fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad, codigo_postal, modalidad, fecha_limite, escolaridad, conocimientos, habilidades, observaciones, numero_vacantes, roles_relacionados } = req.body;
        const vacanteData = normalizarObjetosUndefinedANull({
            id_vacante,id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio,
            fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad,
            codigo_postal, modalidad, fecha_limite, escolaridad, conocimientos,
            habilidades, observaciones, numero_vacantes, roles_relacionados
        });
        try {
            if (!id_vacante || !id_reclutador || !titulo || !descripcion || !duracion || !monto_beca || !horario || !ubicacion || !ciudad || !entidad || !codigo_postal || !modalidad || !escolaridad || !conocimientos || !habilidades || !numero_vacantes) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }
            const resultado = await Reclutador.editarVacante(id_vacante, vacanteData);
            if (!resultado) {
                return res.status(404).json({ message: 'Vacante no encontrada' });
            }
            res.status(200).json({ message: 'Vacante actualizada correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async obtenerVacantesPublicadas(req, res) {
        const { id_reclutador } = req.query;
        try {
            if (!id_reclutador) {
                return res.status(400).json({ message: 'Falta el id_reclutador' });
            }
            const vacantes = await Reclutador.obtenerVacantesPublicadas(id_reclutador);
            if (!vacantes || vacantes.length === 0) {
                return res.status(404).json({ message: 'No se encontraron vacantes' });
            }
            res.status(200).json(vacantes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async obtenerPostulacionesVacante(req, res) {
        const { id_vacante } = req.query;
        try {
            if (!id_vacante) {
                return res.status(400).json({ message: 'Falta el id_vacante' });
            }
            const postulaciones = await Reclutador.obtenerPostulacionesVacante(id_vacante);
            if (!postulaciones || postulaciones.length === 0) {
                return res.status(404).json({ message: 'Vacante no encontrada' });
            }
            res.status(200).json(postulaciones);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async cambiarEstadoVacante(req, res) {
        const { id_vacante, estado } = req.body;
        try {
            if (!id_vacante || !estado) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }
            const resultado = await Reclutador.cambiarEstadoVacante(id_vacante, estado);
            if (!resultado) {
                return res.status(404).json({ message: 'Vacante no encontrada' });
            }
            res.status(200).json({ message: 'Estado de la vacante actualizado correctamente' });
        } catch (error) {
            console.error('Error al cambiar estado de la vacante:', error.message);
            res.status(500).json({ message: error.message });
        }
    }

    static async borrarVacante(req, res) {
        const { id_vacante } = req.body;
        try {
            if (!id_vacante) {
                return res.status(400).json({ message: 'Falta el id_vacante' });
            }
            const resultado = await Reclutador.borrarVacante(id_vacante);
            if (!resultado) 
                return res.status(404).json({ message: 'Vacante no encontrada' });
            res.status(204).json({ message: 'Vacante borrada correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
