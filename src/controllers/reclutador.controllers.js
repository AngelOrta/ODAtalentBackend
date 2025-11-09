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

    static async actualizarVacante(req, res) {
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
