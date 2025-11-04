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
    const { nombre, email, rol, genero, idEmpresa} = req.body;
    try {
        await Usuario.crearAlumno(nombre, email, rol, genero, req.uid, idEmpresa);
        res.status(201).json({ message: 'Usuario registrado' });
    } catch (err) {
      console.log(err);
      if(err.message.includes('Error al registrar en') || err.code === 'ER_DUP_ENTRY'){
        return res.status(400).json({ error: 'Error al registrar Usuario' });
      }
      res.status(500).json({ error: 'Error interno al registrar Usuario' });
    }
  }

  static async encolarReclutador(req, res) {
    const { nombre, email, genero, id_empresa} = req.body;
    try {
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
}