import Alumno from '../models/alumno.models.js';

export default class AlumnoController {
    static async obtenerPostulacionesPorAlumno(req, res) {
        const {id_alumno, estado} = req.query;
        try {
            if (!id_alumno ||( estado!== 'Activa' && estado!=='Expirada' && estado!== undefined)) {
                return res.status(400).json({ message: 'Falta el id del alumno o el estado no es correcto' });
            }

            const postulaciones = await Alumno.obtenerPostulaciones(id_alumno, estado);
            if (!postulaciones) {
                return res.status(404).json({ message: 'No se encontraron postulaciones para el alumno' });
            }
            res.status(200).json(postulaciones);
        } catch (error) {
            console.error('Error al obtener las postulaciones del alumno:', error);
            res.status(500).json({ message: 'Error al obtener las postulaciones del alumno' });
        }
    }

    static async postularseAVacante(req, res) {
        const {id_alumno, id_vacante} = req.body;
        try{
            if (!id_alumno || !id_vacante) {
                return res.status(400).json({ message: 'Falta el id del alumno o de la vacante' });
            }
            const resultado = await Alumno.postularseAVacante(id_alumno, id_vacante);
            if (resultado === 'YaPostulado') {
                return res.status(409).json({ message: 'El alumno ya se ha postulado a esta vacante' });
            }else if (resultado === 'PerfilIncompleto') {
                return res.status(403).json({ message: 'El perfil del alumno está incompleto o no existe, necesita llenar su descripcion, ciudad, telefono y semestre actual y al menos una habilidad técnica registrada' });
            }else if (resultado === 'VacanteNoExiste') {
                return res.status(404).json({ message: 'La vacante a la que intenta postularse no existe' });
            }
            return res.status(201).json({ message: 'Postulación exitosa', id_postulacion: resultado });
        }catch(error){
            console.error('Error al postularse a la vacante:', error);
            res.status(500).json({ message: 'Error al postularse a la vacante' });
        }
    }

    static async cancelarPostulacion(req, res) {
        const {id_alumno, id_vacante} = req.body;
        try{
            if (!id_alumno || !id_vacante) {
                return res.status(400).json({ message: 'Falta el id del alumno o de la vacante' });
            }
            const resultado = await Alumno.cancelarPostulacion(id_alumno, id_vacante);
            if (!resultado) {
                return res.status(404).json({ message: 'No se encontró la postulación para cancelar' });
            }else if (resultado === 'VacanteNoExiste') {
                return res.status(404).json({ message: 'La vacante no existe' });
            }
            return res.status(204).json({ message: 'Postulación cancelada exitosamente' });
        }catch(error){
            console.error('Error al cancelar la postulación:', error);
            res.status(500).json({ message: 'Error al cancelar la postulación' });
        }
    }
}