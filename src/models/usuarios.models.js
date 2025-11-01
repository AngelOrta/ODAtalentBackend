import {pool} from '../db/db.js';

export default class Usuario {
  constructor(id, rol) {
    this.id = id;
    this.rol = rol;
  }

  static async obtenerPorUid(uid) {
    try{
      const [rows] = await pool.query('SELECT * FROM Usuario WHERE uid_firebase = ?', [uid]);
      if (!rows.length) return null;
      return new Usuario(rows[0].id, rows[0].rol);
    }catch(error){
      console.log('Error al obtener Usuario '+ error.message);
      throw error;
    }
  }

  static async crear(nombre, email, rol, genero, uid, idEmpresa) {
    let connection;

    try{
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [respuestaUsuario] = await connection.query('INSERT INTO Usuario (nombre, correo, rol, genero, uid_firebase) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, rol, genero, uid]);

      if(rol === 'alumno'){
        if(!respuestaUsuario.affectedRows)
          throw new Error('Error al registrar en Usuario');
        const idUser = respuestaUsuario.insertId;

        const [respuestaAlumno] = await connection.query('INSERT INTO AlumnoSolicitante (id_usuario) VALUES (?)',
        [idUser]);

        if(!respuestaAlumno.affectedRows)
          throw new Error('Error al registrar en AlumnoSolicitante') ;
      }
      if(rol === 'reclutador'){
        if(!respuestaUsuario.affectedRows)
          throw new Error('Error al registrar en Usuario');
        const idUser = respuestaUsuario.insertId;

        const [respuestaReclutador] = await connection.query('INSERT INTO Reclutador (id_empresa, id_usuario) VALUES (?, ?)',
        [idEmpresa, idUser]);

        if(!respuestaReclutador.affectedRows)
          throw new Error('Error al registrar en Reclutador') ;
      }
      await connection.commit();
      return true;
      
    }catch (error){
      if (connection)
        await connection.rollback();

      console.log(error.message);
      throw error;
    }finally{
      if (connection)
        connection.release();
    }
  }
}