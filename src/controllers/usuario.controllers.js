import Usuario from '../models/usuario.models.js';

export default class UsuariosController {
  static async obtenerUsuarioPorUid(req, res) {
    try {
        //const user = await usuario.getByUid(req.uid);
        const {uid} = req.params;
        const user = await Usuario.obtenerPorUid(uid);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }

  static async registrar(req, res) {
    try {
        const { nombre, email, rol, genero} = req.body;
        await Usuario.crearAlumno(nombre, email, rol, genero, req.uid);
        res.status(201).json({ message: 'Usuario registrado' });
    } catch (err) {
      console.log(err);
      if(err.message.includes('Error al registrar en') || err.code === 'ER_DUP_ENTRY'){
        return res.status(400).json({ error: 'Error al registrar Usuario' });
      }
      res.status(500).json({ error: 'Error interno al registrar Usuario' });
    }
  }

  static async crearAlumno(req, res) {
    try {
      const { nombre, email, genero } = req.body;
      const uid_admin = req.uid;
      if (!nombre || !email || !genero || !uid_admin){
        return res.status(400).json({ error: 'Faltan datos para crear alumno' });
      }
      await Usuario.aCrearAlumno(nombre, email, genero, uid_admin);
      res.status(201).json({ message: 'Alumno creado exitosamente' });
    }
    catch (error) {
      if (error.message.includes('Error al registrar') || error.code === 'ER_DUP_ENTRY') {
        return res.status(500).json({ message: 'Error en la base de datos al crear alumno' });
      }else if (error.message.includes('No tienes permisos para crear alumno')) {
        return res.status(403).json({ message: error.message });
      }else if( error.message.includes('Error al crear'))
        return res.status(500).json({ message: 'Error de firebase al crear alumno' });
      res.status(500).json({ message: 'Error interno al crear alumno', error: error.message });
    }
  }

  static async encolarReclutador(req, res) {
    try {
      if(isNaN(req.body.id_empresa)) {
        return res.status(400).json({ error: 'El id_empresa debe ser un número válido' });
      }
      const { nombre, email, genero, id_empresa} = req.body;
      await Usuario.encolarReclutador(nombre, email, genero, id_empresa);
      res.status(201).json({ message: 'Reclutador encolado' });
    } catch (error) {
      console.log(error);
      if(error.message.includes('Error al registrar en Reclutador') || error.message.includes('Error al registrar en Usuario') || error.code === 'ER_DUP_ENTRY')
        return res.status(400).json({ error: 'Error al encolar reclutador' });

      res.status(500).json({ error: 'Error insterno al encolar reclutador' });
    }    
  }

  static async verReclutadoresPendientes(req, res) {
    try {
      const reclutadores = await Usuario.verReclutadoresPendientes();
      if (!reclutadores) return res.status(404).json({ error: 'No se encontraron reclutadores pendientes' });
      res.status(200).json(reclutadores);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error al obtener reclutadores pendientes' });
    }
  }

  static async aceptarReclutador(req, res) {
    try {
      const { id_reclutador } = req.body;
      await Usuario.aceptarReclutador(id_reclutador);
      res.status(200).json({ message: 'Reclutador aceptado' });
    } catch (error) {
      console.log(error);
      if(error.message.includes('Error'))
        return res.status(400).json({ error: 'Error al aceptar reclutador' });
      res.status(500).json({ error: 'Error interno al aceptar reclutador' });
    }
  }

  static async crearReclutador(req,res){
    try{
      const {nombre, correo, genero, id_empresa } = req.body;
      const uid_admin = req.uid;
      if(!nombre || !correo || !genero || !id_empresa || !uid_admin)
        return res.status(400).json({ error: 'Faltan datos para crear reclutador' });
      if(isNaN(id_empresa)) 
        return res.status(400).json({ error: 'El id_empresa debe ser un número válido' });
      await Usuario.crearReclutador(nombre, correo, genero, id_empresa, uid_admin);
      res.status(201).json({ message: 'Reclutador creado exitosamente' });
    }catch(error){
      if(error.message.includes('permisos'))
        return res.status(403).json({ message: 'No tienes permisos para crear reclutador' });
    }
  }

  static async rechazarReclutador(req, res) {
    try {
      const { id_usuario } = req.body;
      await Usuario.rechazarReclutador(id_usuario);
      res.status(200).json({ message: 'Reclutador rechazado' });
    } catch (error) {
      console.log(error);
      if(error.message.includes('Error'))
        return res.status(400).json({ error: 'Error al rechazar reclutador' });
      res.status(500).json({ error: 'Error interno al rechazar reclutador' });
    }
  }
}