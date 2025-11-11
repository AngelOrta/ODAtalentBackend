import Alumno from '../models/alumno.models.js';

export default class AlumnoController {
    static async obtenerPerfilAlumno(req, res) {
        const {id_alumno} = req.query;
        try {
            if (!id_alumno) {
                return res.status(400).json({ message: 'Falta el id del alumno' });
            }
            const perfilAlumno = await Alumno.obtenerPerfilAlumno(id_alumno);
            if (!perfilAlumno) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json(perfilAlumno);
        } catch (error) {
            console.error('Error al obtener el perfil del alumno:', error);
            res.status(500).json({ message: 'Error al obtener el perfil del alumno' });
        }
    }

    static async actualizarFotoPerfilAlumno(req, res) {
        const {id_alumno, url_foto} = req.body;
        try {
            if (!id_alumno || !url_foto) 
                return res.status(400).json({ message: 'Falta el id del alumno o la URL de la foto' });
            if(!url_foto.match(/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg)$/))
                return res.status(400).json({ message: 'La URL de la foto no es válida' });
            const resultado = await Alumno.actualizarFotoPerfilAlumno(id_alumno, url_foto);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }   
            res.status(200).json({ message: 'Foto de perfil actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar la foto de perfil del alumno:', error);
            res.status(500).json({ message: 'Error al actualizar la foto de perfil del alumno' });
        }
    }

    static async actualizarHabilidadesPerfilAlumno(req, res) {
        const arregloHabilidades = req.body;
        const tiposValidos = new Set(['Técnicas', 'Blandas', 'Idioma']);
        const todosTiposValidos = arregloHabilidades.every(habilidad => tiposValidos.has(habilidad.tipo));
        let tipo;
        try {
            if (!Array.isArray(arregloHabilidades)) {
                return res.status(400).json({ message: 'El body debe contener el arreglo de habilidades' });
            }else if(arregloHabilidades.every(habilidad => typeof habilidad.id_habilidad !== 'number') || arregloHabilidades.every(habilidad => typeof habilidad.id_alumno !== 'number') || !todosTiposValidos) {
                return  res.status(400).json({ message: 'Los id o el tipo no tienen un formato valido' });
            }
            tipo = arregloHabilidades[0].tipo;
            const resultado = await Alumno.actualizarHabilidadesPerfilAlumno(arregloHabilidades, tipo);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json({ message: 'Habilidades actualizadas correctamente' });
        } catch (error) {
            if(error.message === 'Una o más habilidades no existen'){
                return res.status(404).json({ message: 'Una o más habilidades no existen' });
            }
            if(error.message === 'El alumno no existe'){
                return res.status(404).json({ message: 'El alumno no existe' });
            }
            console.error('Error al actualizar las habilidades del perfil del alumno:', error);
            res.status(500).json({ message: 'Error al actualizar las habilidades del perfil del alumno' });
        }
    }

    static async actualizarDescripcionPerfilAlumno(req, res) {
        const {id_alumno, descripcion} = req.body;
        try {
            if (!id_alumno || !descripcion) 
                return res.status(400).json({ message: 'Falta el id del alumno o la descripción' });
            const resultado = await Alumno.actualizarDescripcionPerfilAlumno(id_alumno, descripcion);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json({ message: 'Biografía actualizada correctamente' });
        } catch (error) {
            console.error('Error al actualizar la descripción del perfil del alumno:', error);
            res.status(500).json({ message: 'Error al actualizar la descripción del perfil del alumno' });
        }
    }

    static async subirCVAlumno(req, res) {
        const {id_alumno, url_cv} = req.body;
        try {
            if (!id_alumno || !url_cv) 
                return res.status(400).json({ message: 'Falta el id del alumno o la URL del CV' });
            if(!url_cv.match(/^https?:\/\/.*\.(?:pdf|doc|docx)$/))
                return res.status(400).json({ message: 'La URL del CV no es válida' });
            const resultado = await Alumno.subirCVAlumno(id_alumno, url_cv);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json({ message: 'CV actualizado correctamente' });
        } catch (error) {
            console.error('Error al subir el CV del alumno:', error);
            res.status(500).json({ message: 'Error al subir el CV del alumno' });
        }
    }

    static async actualizarSemestreAlumno(req, res) {
        const {id_alumno, semestre_actual} = req.body;
        try {
            if (!id_alumno || typeof semestre_actual !== 'string')
                return res.status(400).json({ message: 'Falta el id del alumno o el semestre actual' });
            const resultado = await Alumno.actualizarSemestreAlumno(id_alumno, semestre_actual);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json({ message: 'Semestre actual actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar el semestre del alumno:', error);
            if(error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD'){
                return res.status(400).json({ message: 'El formato del semestre no es válido. Ejemplo correcto: "6"' });
            }
            res.status(500).json({ message: 'Error al actualizar el semestre del alumno' });
        }
    }

    static async actualizarCiudadEntidadAlumno(req, res) {
        const {id_alumno, ciudad, entidad} = req.body;
        try {
            if (!id_alumno || !ciudad || !entidad)
                return res.status(400).json({ message: 'Falta el id del alumno, la ciudad o la entidad' });
            const resultado = await Alumno.actualizarCiudadEntidadAlumno(id_alumno, ciudad, entidad);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json({ message: 'Ciudad y entidad actualizadas correctamente' });
        } catch (error) {
            console.error('Error al actualizar la ciudad y entidad del alumno:', error);
            res.status(500).json({ message: 'Error al actualizar la ciudad y entidad del alumno' });
        }
    }

    static async actualizarTelefonoAlumno(req, res) {
        const {id_alumno, telefono} = req.body;
        try {
            if (!id_alumno || !telefono)
                return res.status(400).json({ message: 'Falta el id del alumno o el teléfono' });
            if(!telefono.match(/^\+?[0-9]{10}$/))
                return res.status(400).json({ message: 'El formato del teléfono no es válido' });
            const resultado = await Alumno.actualizarTelefonoAlumno(id_alumno, telefono);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json({ message: 'Teléfono actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar el teléfono del alumno:', error);
            res.status(500).json({ message: 'Error al actualizar el teléfono del alumno' });
        }
    }

    static async actualizarFechaNacimientoAlumno(req, res) {
        const {id_alumno, fecha_nacimiento} = req.body;
        try {
            if (!id_alumno || !fecha_nacimiento)
                return res.status(400).json({ message: 'Falta el id del alumno o la fecha de nacimiento' });
            if(!fecha_nacimiento.match(/^\b(19\d\d|20\d\d)-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b$/))
                return res.status(400).json({ message: 'El formato de la fecha de nacimiento no es válido. Use AAAA-MM-DD' });
            const resultado = await Alumno.actualizarFechaNacimientoAlumno(id_alumno, fecha_nacimiento);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json({ message: 'Fecha de nacimiento actualizada correctamente' });
        } catch (error) {
            console.error('Error al actualizar la fecha de nacimiento del alumno:', error);
            if(error.code === 'ER_TRUNCATED_WRONG_VALUE')
                return res.status(400).json({ message: 'El formato de la fecha de nacimiento no es válido. Use AAAA-MM-DD' });
            res.status(500).json({ message: 'Error al actualizar la fecha de nacimiento del alumno' });
        }
    }

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