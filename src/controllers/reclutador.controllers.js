import Reclutador from '../models/reclutador.models.js';
import normalizarObjetosUndefinedANull from '../helpers/normalizarObjetos.helper.js';

export default class ReclutadorController {
    static async crearVacante(req, res) {
        try {
            const { id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio, fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad, codigo_postal, modalidad, fecha_limite, escolaridad, conocimientos, habilidades, observaciones, numero_vacantes, roles_relacionados } = req.body;
            const vacanteData = normalizarObjetosUndefinedANull({
                id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio,
                fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad,
                codigo_postal, modalidad, fecha_limite, escolaridad, conocimientos,
                habilidades, observaciones, numero_vacantes, roles_relacionados
            });
            if (!id_reclutador || !titulo || !descripcion || !duracion || !monto_beca || !horario || !ubicacion || !ciudad || !entidad || !codigo_postal || !modalidad || !escolaridad || !habilidades || !numero_vacantes) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }
            const idNuevaVacante = await Reclutador.crearVacante(vacanteData);
            if (idNuevaVacante === 'duplicada') {
                return res.status(409).json({ message: 'Ya existe una vacante con los mismos datos, intenta cambiar el nombre' });
            }
            res.status(201).json({message: 'Vacante creada exitosamente', id_vacante: idNuevaVacante});
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async editarVacante(req, res) {
        try {
            const { id_vacante,id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio, fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad, codigo_postal, modalidad, fecha_limite, escolaridad, conocimientos, habilidades, observaciones, numero_vacantes, roles_relacionados } = req.body;
            const vacanteData = normalizarObjetosUndefinedANull({
                id_vacante,id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio,
                fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad,
                codigo_postal, modalidad, fecha_limite, escolaridad, conocimientos,
                habilidades, observaciones, numero_vacantes, roles_relacionados
            });
            if (!id_reclutador || !titulo || !descripcion || !duracion || !monto_beca || !horario || !ubicacion || !ciudad || !entidad || !codigo_postal || !modalidad || !escolaridad || !habilidades || !numero_vacantes) {
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
        try {
            const { id_reclutador } = req.query;
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
        try {
            const { id_vacante } = req.query;
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

    static async obtenerPostulacionesEnRevisionPorIdAlumno(req, res) {
        try {
            const { id_alumno, id_reclutador } = req.query;
            if (!id_alumno || !id_reclutador) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }
            const postulaciones = await Reclutador.obtenerPostulacionesEnRevisionPorIdAlumno(id_alumno, id_reclutador);
            if (!postulaciones || postulaciones.length === 0) {
                return res.status(404).json({ message: 'No se encontraron postulaciones en revisión para el alumno y reclutador proporcionados' });
            }
            res.status(200).json(postulaciones);
        } catch (error) {
            console.error('Error al obtener postulaciones en revisión:', error.message);
            res.status(500).json({ message: error.message });
        }
    }

    static async reclutarAlumno(req, res) {
        try {
            const { id_postulacion, id_vacante, estatus} = req.body;
            if (!id_postulacion || !id_vacante || !estatus) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }
            const resultado = await Reclutador.reclutarAlumno(id_postulacion, id_vacante, estatus);
            if (!resultado) {
                return res.status(404).json({ message: 'Postulación o vacante no encontrada' });
            }
            if (resultado === 'noVacantes') {
                return res.status(400).json({ message: 'No hay vacantes disponibles para esta vacante' });
            }
            res.status(200).json({ message: 'Estatus de la postulacion actualizado a Reclutado' });
        } catch (error) {
            console.error('Error al reclutar alumno:', error.message);
            res.status(500).json({ message: error.message });
        }
    }

    static async rechazarPostulacionAlumno(req, res) {
        try {
            const { id_postulacion, estatus} = req.body;
            if (!id_postulacion || !estatus) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }
            if (estatus !== 'Rechazado') {
                return res.status(400).json({ message: 'Estatus inválido. Debe ser "Rechazado".' });
            }
            const resultado = await Reclutador.rechazarPostulacionAlumno(id_postulacion);
            if (!resultado) {
                return res.status(404).json({ message: 'Postulación no encontrada' });
            }
            res.status(200).json({ message: 'Estatus de la postulacion actualizado a Rechazado' });
        } catch (error) {
            console.error('Error al rechazar postulacion del alumno:', error.message);
            res.status(500).json({ message: error.message });
        }
    }

    static async obtenerAlumnosReclutados(req, res) {
        try {
            const { id_reclutador } = req.query;
            if (!id_reclutador) {
                return res.status(400).json({ message: 'Falta el id_reclutador' });
            }
            const alumnos = await Reclutador.obtenerAlumnosReclutados(id_reclutador);
            if (!alumnos || alumnos.length === 0) {
                return res.status(404).json({ message: 'No se encontraron alumnos reclutados' });
            }
            res.status(200).json(alumnos);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async marcarPostulacionComoCompletada(req, res) {
        try {
            const { id_postulacion, estatus } = req.body;
            if (!id_postulacion || !estatus) {
                return res.status(400).json({ message: 'Falta el id_postulacion' });
            }
            const resultado = await Reclutador.marcarPostulacionComoCompletada(id_postulacion);
            if (!resultado) {
                return res.status(404).json({ message: 'Postulación no encontrada' });
            }
            res.status(200).json({ message: 'Estatus de la postulación actualizado a Completado' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }   
    }

    static async cambiarEstadoVacante(req, res) {
        try {
            const { id_vacante, estado } = req.body;
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
        try {
            const { id_vacante } = req.body;
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

    static async obtenerPerfilReclutador(req, res) {
        try {
            const { id_reclutador } = req.query;
            if (!id_reclutador) {
                return res.status(400).json({ message: 'Falta el id_reclutador' });
            }
            const perfil = await Reclutador.obtenerPerfilReclutador(id_reclutador);
            if (!perfil) {
                return res.status(404).json({ message: 'Reclutador no encontrado' });
            }
            res.status(200).json(perfil);
        } catch (error) {
            res.status(500).json({ message: "Error al cargar el perfil: "+error.message });
        }
    }

    static async actualizarFotoPerfil(req, res) {
        try {
            const { id_reclutador, url_foto_perfil } = req.body;
            if (!id_reclutador || !url_foto_perfil) {
                return res.status(400).json({ message: 'Faltan campos obligatorios' });
            }else if(!url_foto_perfil.match(/^https?:\/\/.+/)){
                return res.status(400).json({ message: 'URL de foto de perfil inválida' });
            }
            const resultado = await Reclutador.actualizarFotoPerfil(id_reclutador, url_foto_perfil);
            if (!resultado) {
                return res.status(404).json({ message: 'Reclutador no encontrado' });
            }
            res.status(200).json({ message: 'Foto de perfil guardada correctamente' });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar la foto de perfil: '+error.message });
        }   
    }
}
