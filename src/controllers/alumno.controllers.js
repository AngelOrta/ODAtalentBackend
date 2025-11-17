import Alumno from '../models/alumno.models.js';
import normalizarObjetosUndefinedANull from '../helpers/normalizarObjetos.helper.js';

export default class AlumnoController {
    static async obtenerPerfilAlumno(req, res) {
        try {
            const {id_alumno} = req.query;
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
        try {
            const {id_alumno, url_foto} = req.body;
            if (!id_alumno || !url_foto) 
                return res.status(400).json({ message: 'Falta el id del alumno o la URL de la foto' });
            if(!url_foto.match(/^https?:\/\/.*$/))
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
        try {
            const arregloHabilidades = req.body;
            const tiposValidos = new Set(['Técnicas', 'Blandas', 'Idioma']);
            const todosTiposValidos = arregloHabilidades.every(habilidad => tiposValidos.has(habilidad.tipo));
            let tipo;
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
        try {
            const {id_alumno, descripcion} = req.body;
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
        try {
            const uid_alumno = req.uid;
            //console.log(req.uid);
            //const {uid_alumno, url_cv} = req.body;
            const {url_cv} = req.body;
            if (!uid_alumno || !url_cv) 
                return res.status(400).json({ message: 'Falta el id del alumno o la URL del CV' });
            if(!url_cv.match(/^cv\/.*\.(?:pdf)$/))
                return res.status(400).json({ message: 'La URL del CV no es válida' });
            const resultado = await Alumno.subirCVAlumno(uid_alumno, url_cv);
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
        try {
            const {id_alumno, semestre_actual} = req.body;
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
        try {
            const {id_alumno, ciudad, entidad} = req.body;
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
        try {
            const {id_alumno, telefono} = req.body;
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
        try {
            const {id_alumno, fecha_nacimiento} = req.body;
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

    static async agregarEscolaridadAlumno(req, res) { 
        try {
            let {id_alumno, nivel, institucion, carrera, plantel, nota, fecha_inicio, fecha_fin } = req.body;
            const nivelesValidos = new Set(['Bachillerato General','Tecnólogo','Bachillerato Tecnológico','Profesional Técnico','Técnico Superior Universitario', 'Licenciatura']);
            const notasValidas = new Set(['Cursando','Titulado','Pasante', 'Egresado','Trunca']);
            if(!carrera) carrera = null;
            if (!id_alumno || !nivel || !institucion || !plantel || !nota || !fecha_inicio || !fecha_fin)
                return res.status(400).json({ message: 'Faltan campos obligatorios para agregar la escolaridad' });
            if (!nivelesValidos.has(nivel) || !notasValidas.has(nota)) {
                return res.status(400).json({ message: 'El nivel o la nota no son válidos' });
            }
            const resultado = await Alumno.agregarEscolaridadAlumno(id_alumno, nivel, institucion, carrera, plantel, nota, fecha_inicio, fecha_fin);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }else if(resultado === 'duplicado'){
                return res.status(409).json({ message: 'Ya existe una escolaridad con el mismo nivel, institución y plantel para este alumno' });
            }
            res.status(201).json({ message: 'Escolaridad agregada correctamente', id_escolaridad: resultado });
        } catch (error) {
            console.error('Error al agregar la escolaridad del alumno:', error);
            if(error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD'){
                return res.status(400).json({ message: 'El formato de alguno de los campos no es válido' });
            }
            res.status(500).json({ message: 'Error al agregar la escolaridad del alumno' });
        }
    }

    static async actualizarEscolaridadAlumno(req, res) {
        try {
            let {id_escolaridad, id_alumno, nivel, institucion, carrera, plantel, nota, fecha_inicio, fecha_fin } = req.body;
            const nivelesValidos = new Set(['Bachillerato General','Tecnólogo','Bachillerato Tecnológico','Profesional Técnico','Técnico Superior Universitario', 'Licenciatura']);
            const notasValidas = new Set(['Cursando','Titulado','Pasante', 'Egresado','Trunca']);
            if(!carrera) carrera = null;
            if (!id_escolaridad || !nivel || !institucion || !plantel || !nota || !fecha_inicio || !fecha_fin)
                return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar la escolaridad' });
            if (!nivelesValidos.has(nivel) || !notasValidas.has(nota)) {
                return res.status(400).json({ message: 'El nivel o la nota no son válidos' });
            }
            const resultado = await Alumno.actualizarEscolaridadAlumno(id_escolaridad,id_alumno, nivel, institucion, carrera, plantel, nota, fecha_inicio, fecha_fin);
            if (!resultado) {
                return res.status(404).json({ message: 'Escolaridad o alumno no encontrados' });
            }else if(resultado === 'duplicado'){
                return res.status(409).json({ message: 'Ya existe una escolaridad con el mismo nivel, institución y plantel para este alumno' });
            }
            res.status(200).json({ message: 'Escolaridad actualizada correctamente' });
        } catch (error) {
            console.error('Error al actualizar la escolaridad del alumno:', error);
            if(error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD'){
                return res.status(400).json({ message: 'El formato de alguno de los campos no es válido' });
            }
            res.status(500).json({ message: 'Error al actualizar la escolaridad del alumno' });
        }
    }

    static async eliminarEscolaridadAlumno(req, res) {
        try {
            const {id_escolaridad, id_alumno} = req.body;
            if (!id_escolaridad || !id_alumno)
                return res.status(400).json({ message: 'Falta el id de la escolaridad a eliminar o el id del alumno' });
            const resultado = await Alumno.eliminarEscolaridadAlumno(id_escolaridad, id_alumno);
            if (!resultado) {
                return res.status(404).json({ message: 'Escolaridad o alumno no encontrados' });
            }
            res.status(204).json({ message: 'Escolaridad eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la escolaridad del alumno:', error);
            res.status(500).json({ message: 'Error al eliminar la escolaridad del alumno' });
        }
    }
    
    static async agregarUrlExternaAlumno(req, res) {
        try {
            const {id_alumno, url_externa, tipo} = req.body;
            const tiposValidos = new Set(['LinkedIn', 'GitHub', 'Blog', 'Portafolio', 'Otro']);
            if (!id_alumno || !url_externa || !tipo)
                return res.status(400).json({ message: 'Faltan campos obligatorios para agregar la URL externa' });
            if (!tiposValidos.has(tipo)) {
                return res.status(400).json({ message: 'El tipo de URL externa no es válido' });
            }
            const resultado = await Alumno.agregarUrlExternaAlumno(id_alumno, url_externa, tipo);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            if(resultado === 'duplicado'){
                return res.status(409).json({ message: 'Ya existe una URL externa con el mismo tipo para este alumno' });
            }
            res.status(201).json({ message: 'URL externa agregada correctamente', id_url_externa: resultado });
        } catch (error) {
            console.error('Error al agregar la URL externa del alumno:', error);
            res.status(500).json({ message: 'Error al agregar la URL externa del alumno' });
        }
    }

    static async actualizarUrlExternaAlumno(req, res) {
        try {
            const {id_url, id_alumno, url_externa, tipo} = req.body;
            const tiposValidos = new Set(['LinkedIn', 'GitHub', 'Blog', 'Portafolio', 'Otro']);
            if (!id_url|| !id_alumno || !url_externa || !tipo)
                return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar la URL externa' });
            if (!tiposValidos.has(tipo)) {
                return res.status(400).json({ message: 'El tipo de URL externa no es válido' });
            }
            const resultado = await Alumno.actualizarUrlExternaAlumno(id_url, id_alumno, url_externa, tipo);
            if (!resultado) {
                return res.status(404).json({ message: 'URL externa o alumno no encontrados' });
            }
            if(resultado === 'duplicado'){
                return res.status(409).json({ message: 'Ya existe una URL externa con el mismo tipo para este alumno' });
            }
            res.status(200).json({ message: 'URL externa actualizada correctamente' });
        } catch (error) {
            console.error('Error al actualizar la URL externa del alumno:', error);
            res.status(500).json({ message: 'Error al actualizar la URL externa del alumno' });
        }
    }

    static async eliminarUrlExternaAlumno(req, res) {
        try {
            const {id_url, id_alumno} = req.body;
            if (!id_url || !id_alumno)
                return res.status(400).json({ message: 'Falta el id de la URL externa a eliminar o el id del alumno' });
            const resultado = await Alumno.eliminarUrlExternaAlumno(id_url, id_alumno);
            if (!resultado) {
                return res.status(404).json({ message: 'URL externa o alumno no encontrados' });
            }
            res.status(204).json({ message: 'URL externa eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la URL externa del alumno:', error);
            res.status(500).json({ message: 'Error al eliminar la URL externa del alumno' });
        }
    }

    static async agregarCursoAlumno(req, res) {
        try {
            const {id_alumno, nombre, institucion, fecha_inicio, fecha_fin} = req.body;
            if (!id_alumno || !nombre || !institucion || !fecha_inicio || !fecha_fin)
                return res.status(400).json({ message: 'Faltan campos obligatorios para agregar el curso' });
            const resultado = await Alumno.agregarCursoAlumno(id_alumno, nombre, institucion, fecha_inicio, fecha_fin);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }else if(resultado === 'duplicado'){
                return res.status(409).json({ message: 'Ya existe un curso con el mismo nombre e institución para este alumno' });
            }
            res.status(201).json({ message: 'Curso agregado correctamente', id_curso: resultado });
        } catch (error) {
            console.error('Error al agregar el curso del alumno:', error);
            res.status(500).json({ message: 'Error al agregar el curso del alumno' });
        }
    }
    
    static async actualizarCursoAlumno(req, res) {
        try {
            const {id_curso, id_alumno, nombre, institucion, fecha_inicio, fecha_fin} = req.body;
            if (!id_curso || !id_alumno || !nombre || !institucion || !fecha_inicio || !fecha_fin)
                return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar el curso' });
            const resultado = await Alumno.actualizarCursoAlumno(id_curso, id_alumno, nombre, institucion, fecha_inicio, fecha_fin);
            if (!resultado) {
                return res.status(404).json({ message: 'Curso o alumno no encontrados' });
            }else if(resultado === 'duplicado'){
                return res.status(409).json({ message: 'Ya existe un curso con el mismo nombre e institución para este alumno' });
            }
            res.status(200).json({ message: 'Curso actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar el curso del alumno:', error);
            res.status(500).json({ message: 'Error al actualizar el curso del alumno' });
        }
    }

    static async eliminarCursoAlumno(req, res) {
        try {
            const {id_curso, id_alumno} = req.body;
            if (!id_curso || !id_alumno)
                return res.status(400).json({ message: 'Falta el id del curso a eliminar o el id del alumno' });
            const resultado = await Alumno.eliminarCursoAlumno(id_curso, id_alumno);
            if (!resultado) {
                return res.status(404).json({ message: 'Curso o alumno no encontrados' });
            }
            res.status(204).json({ message: 'Curso eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el curso del alumno:', error);
            res.status(500).json({ message: 'Error al eliminar el curso del alumno' });
        }
    }

    static async agregarCertificadoAlumno(req, res) {
        try {
            const {id_alumno, nombre, institucion, fecha_expedicion, fecha_caducidad, id_credencial, url_certificado, habilidades_desarrolladas} = req.body;
            const certificadoData = normalizarObjetosUndefinedANull({id_alumno, nombre, institucion, fecha_expedicion, fecha_caducidad, id_credencial, url_certificado, habilidades_desarrolladas});
            if (!id_alumno || !nombre || !institucion || !fecha_expedicion)
                return res.status(400).json({ message: 'Faltan campos obligatorios para agregar el certificado' });
            const resultado = await Alumno.agregarCertificadoAlumno(certificadoData);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }else if(resultado === 'duplicado'){
                return res.status(409).json({ message: 'El certificado ya existe para este alumno' });
            }
            res.status(201).json({ message: 'Certificado agregado correctamente', id_certificado: resultado });
        } catch (error) {
            if(error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD'){
                return res.status(400).json({ message: 'El formato de alguno de los campos no es válido' });
            }
            if(error.code === 'ER_DUP_ENTRY'){
                return res.status(409).json({ message: 'El certificado ya existe para este alumno' });
            }
            res.status(500).json({ message: 'Error al agregar el certificado del alumno' });
        }
    }

    static async actualizarCertificadoAlumno(req, res) {
        try {
            const {id_certificado, id_alumno, nombre, institucion, fecha_expedicion, fecha_caducidad, id_credencial, url_certificado, habilidades_desarrolladas} = req.body;
            const certificadoData = normalizarObjetosUndefinedANull({id_certificado, id_alumno, nombre, institucion, fecha_expedicion, fecha_caducidad, id_credencial, url_certificado, habilidades_desarrolladas});
            if (!id_certificado || !id_alumno || !nombre || !institucion || !fecha_expedicion)
                return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar el certificado' });
            const resultado = await Alumno.actualizarCertificadoAlumno(certificadoData);
            if (!resultado) {
                return res.status(404).json({ message: 'Certificado, alumno o habilidades no encontrados' });
            }
            res.status(200).json({ message: 'Certificado actualizado correctamente' });
        } catch (error) {
            if(error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD'){
                return res.status(400).json({ message: 'El formato de alguno de los campos no es válido' });
            }
            if(error.code === 'ER_DUP_ENTRY'){
                return res.status(409).json({ message: 'El certificado ya existe para este alumno' });
            }
            res.status(500).json({ message: 'Error al actualizar el certificado del alumno' });
        }
    }

    static async eliminarCertificadoAlumno(req, res) {
        try {
            const {id_certificado, id_alumno} = req.body;
            if (!id_certificado || !id_alumno)
                return res.status(400).json({ message: 'Falta el id del certificado a eliminar o el id del alumno' });
            const resultado = await Alumno.eliminarCertificadoAlumno(id_certificado, id_alumno);
            if (!resultado) {
                return res.status(404).json({ message: 'Certificado o alumno no encontrados' });
            }
            res.status(204).json({ message: 'Certificado eliminado correctamente' });
        } catch (error) {
            console.error( error);
            res.status(500).json({ message: 'Error al eliminar el certificado del alumno' });
        }
    }

    static async agregarExperienciaLaboralAlumno(req, res) {
        try {
            const {id_alumno, cargo, empresa,fecha_inicio, fecha_fin, descripcion, habilidades_desarrolladas } = req.body;
            const experienciaData = normalizarObjetosUndefinedANull({id_alumno, cargo, empresa,fecha_inicio, fecha_fin, descripcion, habilidades_desarrolladas });
            if (!id_alumno || !cargo || !empresa || !fecha_inicio)
                return res.status(400).json({ message: 'Faltan campos obligatorios para agregar la experiencia laboral' });
            const resultado = await Alumno.agregarExperienciaLaboralAlumno(experienciaData);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            if(resultado === 'duplicado'){
                return res.status(409).json({ message: 'Ya existe una experiencia laboral con el mismo cargo y empresa para este alumno' });
            }
            if(resultado === 'noHabilidad'){
                return res.status(404).json({ message: 'Una o más habilidades no existen' });
            }
            if(resultado === 'duplicadoHabilidad'){
                return res.status(404).json({ message: 'Una o más habilidades duplicadas' });
            }
            res.status(201).json({ message: 'Experiencia laboral agregada correctamente', id_experiencia: resultado });
        } catch (error) {
            console.error('Error al agregar la experiencia laboral del alumno:', error);
            res.status(500).json({ message: 'Error al agregar la experiencia laboral del alumno' });
        }
    }

    static async actualizarExperienciaLaboralAlumno(req, res) {
        try {
            const {id_experiencia, id_alumno, cargo, empresa,fecha_inicio, fecha_fin, descripcion, habilidades_desarrolladas } = req.body;
            const experienciaData = normalizarObjetosUndefinedANull({id_experiencia, id_alumno, cargo, empresa,fecha_inicio, fecha_fin, descripcion, habilidades_desarrolladas });
            if (!id_experiencia || !id_alumno || !cargo || !empresa || !fecha_inicio)
                return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar la experiencia laboral' });
            const resultado = await Alumno.actualizarExperienciaLaboralAlumno(experienciaData);
            if (!resultado) {
                return res.status(404).json({ message: 'Experiencia laboral, alumno o habilidades no encontrados' });
            }
            if(resultado === 'noHabilidad'){
                return res.status(404).json({ message: 'Una o más habilidades no existen' });
            }
            if(resultado === 'duplicadoHabilidad'){
                return res.status(404).json({ message: 'Una o más habilidades duplicadas' });
            }
            if(resultado === 'duplicado'){
                return res.status(409).json({ message: 'Ya existe una experiencia laboral con el mismo cargo y empresa para este alumno' });
            }
            res.status(200).json({ message: 'Experiencia laboral actualizada correctamente' });
        } catch (error) {
            console.error('Error al actualizar la experiencia laboral del alumno:', error);
            res.status(500).json({ message: 'Error al actualizar la experiencia laboral del alumno' });
        }
    }

    static async eliminarExperienciaLaboralAlumno(req, res) {
        try {
            const {id_experiencia, id_alumno} = req.body;
            if (!id_experiencia || !id_alumno)
                return res.status(400).json({ message: 'Falta el id de la experiencia laboral a eliminar o el id del alumno' });
            const resultado = await Alumno.eliminarExperienciaLaboralAlumno(id_experiencia, id_alumno);
            if (!resultado) {
                return res.status(404).json({ message: 'Experiencia laboral o alumno no encontrados' });
            }
            res.status(204).json({ message: 'Experiencia laboral eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la experiencia laboral del alumno:', error);
            res.status(500).json({ message: 'Error al eliminar la experiencia laboral del alumno' });
        }
    }

    static async eliminarCuentaAlumno(req, res) {
        try {
            const {id_usuario, id_alumno} = req.body;
            if (!id_alumno || !id_usuario)
                return res.status(400).json({ message: 'Falta el id del alumno' });
            const resultado = await Alumno.eliminarCuentaAlumno(id_usuario, id_alumno);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(204).json({ message: 'Cuenta del alumno eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la cuenta del alumno:', error);
            res.status(500).json({ message: 'Error al eliminar la cuenta del alumno' });
        }
    }

    static async obtenerPerfilAlumnoVistaReclutador(req, res) {
        try {
            const {id_alumno} = req.query;
            if (!id_alumno) {
                return res.status(400).json({ message: 'Falta el id del alumno' });
            }
            const perfilAlumno = await Alumno.obtenerPerfilPublicoAlumno(id_alumno,false);
            if (!perfilAlumno) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json(perfilAlumno);
        } catch (error) {
            console.error('Error al obtener el perfil del alumno para reclutador:', error);
            res.status(500).json({ message: 'Error al obtener el perfil del alumno para reclutador' });
        }
    }


    static async obtenerPerfilPublicoAlumno(req, res) {
        try {
            const {id_alumno} = req.query;
            if (!id_alumno) {
                return res.status(400).json({ message: 'Falta el id del alumno' });
            }
            const perfilPublico = await Alumno.obtenerPerfilPublicoAlumno(id_alumno, true);
            if (!perfilPublico) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json(perfilPublico);
        } catch (error) {
            console.error('Error al obtener el perfil público del alumno:', error);
            res.status(500).json({ message: 'Error al obtener el perfil público del alumno' });
        }
    }

    static async obtenerPostulacionesPorAlumno(req, res) {
        try {
            const {id_alumno, estado} = req.query;
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
        try{
            const {id_alumno, id_vacante} = req.body;
            console.log(req.body);
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
            }else if (resultado === 'VacanteExpirada') {
                return res.status(403).json({ message: 'La vacante a la que intenta postularse ha expirado' });
            }
            return res.status(201).json({ message: 'Postulación exitosa', id_postulacion: resultado });
        }catch(error){
            console.error('Error al postularse a la vacante:', error);
            res.status(500).json({ message: 'Error al postularse a la vacante' });
        }
    }

    static async cancelarPostulacion(req, res) {
        try{
            const {id_alumno, id_vacante} = req.body;
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

    static async obtenerHistorialBusquedas(req, res) {
        try {
            let {id_alumno, limit} = req.query;
            if(!limit || isNaN(parseInt(limit)) || parseInt(limit) <=0){
                limit = null;
            }
            if (!id_alumno) {
                return res.status(400).json({ message: 'Falta el id del alumno' });
            }
            const historial = await Alumno.obtenerHistorialBusquedas(id_alumno, limit);
            if (!historial) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(200).json(historial);
        } catch (error) {
            console.error('Error al obtener el historial de búsquedas del alumno:', error);
            res.status(500).json({ message: 'Error al obtener el historial de búsquedas del alumno' });
        }
    }

    static async limpiarHistorialBusquedas(req, res) {
        try {
            const {id_alumno} = req.body;
            if (!id_alumno) {
                return res.status(400).json({ message: 'Falta el id del alumno' });
            }
            const resultado = await Alumno.limpiarHistorialBusquedas(id_alumno);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno no encontrado' });
            }
            res.status(204).json({ message: 'Historial de búsquedas limpiado correctamente' });
        } catch (error) {
            console.error('Error al limpiar el historial de búsquedas del alumno:', error);
            res.status(500).json({ message: 'Error al limpiar el historial de búsquedas del alumno' });
        }
    }
    
    static async borrarBusquedaPorId(req, res) {
        try {
            const {id_alumno, id_busqueda} = req.body;
            if (!id_alumno || !id_busqueda) {
                return res.status(400).json({ message: 'Falta el id del alumno o el id de la búsqueda' });
            }
            const resultado = await Alumno.borrarBusquedaPorId(id_alumno, id_busqueda);
            if (!resultado) {
                return res.status(404).json({ message: 'Alumno o búsqueda no encontrados' });
            }
            res.status(204).json({ message: 'Búsqueda eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la búsqueda del alumno:', error.message);
            res.status(500).json({ message: 'Error al eliminar la búsqueda del alumno' });
        }
    }
}