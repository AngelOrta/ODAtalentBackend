import {pool} from '../db/db.js';
import { getAuth } from 'firebase-admin/auth';
import {enviarCorreoBienvenidaReclutador} from '../services/mail.services.js';
import Reclutador from './reclutador.models.js';


export default class Usuario {
  constructor(id, rol, id_rol) {
    this.id = id;
    this.rol = rol;
    this.id_rol= id_rol; //el id en su tabla correspondiente (AlumnoSolicitante, Reclutador)
  }

  static async obtenerPorUid(uid) {
    try{
      const [rows] = await pool.query('SELECT * FROM Usuario WHERE uid_firebase = ?', [uid]);
      if (!rows.length) return null;
      if(rows[0].rol === 'alumno'){
        const [rowsAlumno] = await pool.query('SELECT id_alumno FROM AlumnoSolicitante WHERE id_usuario = ?', [rows[0].id]);
        return new Usuario(rows[0].id, rows[0].rol, rowsAlumno[0].id_alumno);
      }
      if(rows[0].rol === 'reclutador'){
        const [rowsReclutador] = await pool.query('SELECT id_reclutador FROM Reclutador WHERE id_usuario = ?', [rows[0].id]);
        return new Usuario(rows[0].id, rows[0].rol, rowsReclutador[0].id_reclutador);
      }
      return new Usuario(rows[0].id, rows[0].rol, null);
    }catch(error){
      console.log('Error al obtener Usuario '+ error.message);
      throw error;
    }
  }

  static async crearAlumno(nombre, email, rol, genero, uid) {
    let connection;

    try{
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [respuestaUsuario] = await connection.query('INSERT INTO Usuario (nombre, correo, rol, genero, uid_firebase) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, rol, genero, uid]);

      if(!respuestaUsuario.affectedRows)
        throw new Error('Error al registrar en Usuario');
      const idUser = respuestaUsuario.insertId;

      const [respuestaAlumno] = await connection.query('INSERT INTO AlumnoSolicitante (id_usuario) VALUES (?)',
      [idUser]);

      if(!respuestaAlumno.affectedRows)
        throw new Error('Error al registrar en AlumnoSolicitante') ;

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

  static async aCrearAlumno(nombre, email, rol, genero, uid_admin) {
    let connection;

    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [verifAdminRes] = await connection.query('SELECT * FROM Usuario WHERE uid_firebase = ? AND rol = ?', [uid_admin, 'admin']);
      if (!verifAdminRes.length)
        throw new Error('No tienes permisos para crear alumno');

      const [respuestaUsuario] = await connection.query('INSERT INTO Usuario (nombre, correo, rol, genero) VALUES (?, ?, ?, ?)',
        [nombre, email, rol, genero]);

      if (!respuestaUsuario.affectedRows)
        throw new Error('Error al registrar en Usuario');
      
      const idUser = respuestaUsuario.insertId;

      const [respuestaAlumno] = await connection.query('INSERT INTO AlumnoSolicitante (id_usuario) VALUES (?)',
        [idUser]);

      if (!respuestaAlumno.affectedRows)
        throw new Error('Error al registrar en AlumnoSolicitante');

      const userRecord = await getAuth().createUser({
            email: email,
            emailVerified: true,
            displayName: nombre,
        });

      if (!userRecord.uid)
        throw new Error('Error al crear reclutador en Firebase');
      
      const [resultActualizarUid] = await connection.query(
        'UPDATE Usuario SET uid_firebase = ? WHERE id = ?',
        [userRecord.uid, idUser]);
      if (!resultActualizarUid.affectedRows)
        throw new Error('Error al actualizar uid del reclutador');

      const actionLink = await getAuth().generatePasswordResetLink(email);
      if (!actionLink)
        throw new Error('Error al generar enlace de restablecimiento de contraseña');
      const resultadoEnvioEmail = await enviarCorreoBienvenidaReclutador(email, actionLink);
      if (!resultadoEnvioEmail.success)
        throw new Error('Error al enviar correo de bienvenida a reclutador');

      await connection.commit();
      return true;
    } catch (error) {
      if (connection)
        await connection.rollback();

      console.log(error.message || error.sqlMessage);
      throw error;
    } finally {
      if (connection)
        connection.release();
    }
  }

  static async encolarReclutador(nombre, correo, genero, id_empresa) {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [resultUsuario] = await connection.query('INSERT INTO Usuario (nombre,correo, rol, genero) VALUES (?, ?, ?, ?)', [nombre, correo, 'reclutador', genero]);
      
      if (!resultUsuario.affectedRows)
        throw new Error('Error al registrar en Usuario');
    

      const idUsuario = resultUsuario.insertId;
      const [resultReclutador] = await connection.query('INSERT INTO Reclutador (id_empresa, id_usuario) VALUES (?, ?)', [id_empresa, idUsuario]);

      if (!resultReclutador.affectedRows)
        throw new Error('Error al registrar en Reclutador');

      await connection.commit();
      return resultReclutador.insertId;
    } catch (error) {
      if (connection)
        await connection.rollback();

      console.log(error.message);
      throw error;
    }finally{
      if (connection)
        connection.release();
    }
  }

  static async verReclutadoresPendientes() {
    try {
      const [rows] = await pool.query('SELECT R.id_reclutador, U.nombre, U.correo, E.nombre AS empresa, E.id_empresa, R.id_usuario FROM Reclutador R JOIN Usuario U ON R.id_usuario = U.id JOIN Empresa E ON R.id_empresa = E.id_empresa WHERE R.estado = ?', ['Pendiente']);
      if (!rows.length) return null;
      return rows.map(row => new Reclutador(row.id_reclutador, row.nombre, row.correo, row.empresa, null, 'Pendiente', row.id_empresa, row.id_usuario));
    } catch (error) {
      console.log('Error al obtener reclutadores pendientes: ' + error.message);
      throw error;
    }
  }

  static async aceptarReclutador(id_reclutador) {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [resultAceptar] = await connection.query('UPDATE Reclutador SET estado = ? WHERE id_reclutador = ?', ['Aprobado', id_reclutador]);
      if (!resultAceptar.affectedRows)
        throw new Error('Error al aceptar reclutador');

      const [resultVerEmail] = await connection.query(
        `SELECT U.id, U.nombre, U.correo FROM Usuario U
         JOIN Reclutador R ON U.id = R.id_usuario
         WHERE R.id_reclutador = ?`, [id_reclutador]);
      if (!resultVerEmail.length)
        throw new Error('Error al obtener correo del reclutador');

      const userRecord = await getAuth().createUser({
            email: resultVerEmail[0].correo,
            emailVerified: true,
            displayName: resultVerEmail[0].nombre,
        });
      
      if (!userRecord.uid)
        throw new Error('Error al crear reclutador en Firebase');
      
      const [resultActualizarUid] = await connection.query(
        'UPDATE Usuario SET uid_firebase = ? WHERE id = ?',
        [userRecord.uid, resultVerEmail[0].id]);
      if (!resultActualizarUid.affectedRows)
        throw new Error('Error al actualizar uid del reclutador');
      
      const actionLink = await getAuth().generatePasswordResetLink(resultVerEmail[0].correo);
      if (!actionLink)
        throw new Error('Error al generar enlace de restablecimiento de contraseña');
      const resultadoEnvioEmail = await enviarCorreoBienvenidaReclutador(resultVerEmail[0].correo, actionLink);
      if (!resultadoEnvioEmail.success)
        throw new Error('Error al enviar correo de bienvenida a reclutador');

      await connection.commit();
      return true;
    } catch (error) {
      if (connection)
          await connection.rollback();

      console.log(error.message);
      throw error;
    }finally{
      if (connection)
        connection.release();
    }
  }

  static async crearReclutador(nombre, correo, genero, id_empresa, uid_firebase){
    try{
      const [verifAdminRes] = await pool.query('SELECT * FROM Usuario WHERE uid_firebase = ? AND rol = ?', [uid_firebase, 'admin']);
      if(!verifAdminRes.length)
        throw new Error('No tienes permisos para crear reclutador');
      const id_reclutador = await this.encolarReclutador(nombre, correo, genero, id_empresa);
      await this.aceptarReclutador(id_reclutador);
    }catch(error){
      console.log('Error al crear reclutador: '+error.message)
      throw error;
    }
  }

  static async rechazarReclutador(id_usuario) {
      const [resultRechazar] = await pool.query('DELETE FROM Usuario WHERE id = ?', [id_usuario]);
      if (!resultRechazar.affectedRows)
        throw new Error('Error al rechazar reclutador');

      return true;
  }

  static async verAlumnos(uid_admin, page, offset, limit) {
    try{
      let total_paginas;
      let total_alumnos;
      let total_alumnos_inactivos=0;
      let alumnos;
      const [verifAdminRes] = await pool.query('SELECT * FROM Usuario WHERE uid_firebase = ? AND rol = ?', [uid_admin, 'admin']);
      if (!verifAdminRes.length)
        throw new Error('No tienes permisos para ver alumnos');
 
      const [rows] = await pool.query('SELECT COUNT(*) AS total FROM AlumnoSolicitante AS A_S JOIN Usuario U ON A_S.id_usuario = U.id WHERE U.uid_firebase IS NOT NULL');
      total_alumnos = rows[0].total;
      if (total_alumnos === 0) return null;

      const [rowsInactivos] = await pool.query('SELECT COUNT(*) AS total FROM AlumnoSolicitante AS A_S JOIN Usuario U ON A_S.id_usuario = U.id WHERE U.uid_firebase IS NULL');
      total_alumnos_inactivos = rowsInactivos[0].total;

      total_paginas = Math.ceil(total_alumnos / limit);
      [alumnos] = await pool.query(
        `SELECT U.id AS id_usuario, U.nombre, U.correo, U.genero, U.url_foto_perfil , A_S.id_alumno
        FROM Usuario U
        JOIN AlumnoSolicitante A_S ON U.id = A_S.id_usuario
        WHERE U.uid_firebase IS NOT NULL
        ORDER BY U.id
        LIMIT ? OFFSET ?`, [limit, offset]);
      
      const alumnosJson = {
        paginacion: {
          total_alumnos: total_alumnos,
          total_paginas: total_paginas,
          pagina_actual: page,
          tamano_pagina: limit,
          total_alumnos_inactivos: total_alumnos_inactivos
        },
        alumnos: alumnos
      };
      return alumnosJson;
    }catch(error){
      console.log('Error al obtener alumnos: '+ (error.message|| error.sqlMessage));
      throw error;
    }
  }

  static async verReclutadores(uid_admin, page, offset, limit) {
    try{
      const [verifAdminRes] = await pool.query('SELECT * FROM Usuario WHERE uid_firebase = ? AND rol = ?', [uid_admin, 'admin']);
      if (!verifAdminRes.length)
        throw new Error('No tienes permisos para ver reclutadores');
      const [rows] = await pool.query('SELECT COUNT(*) AS total FROM Reclutador');
      const total_reclutadores = rows[0].total;
      if (total_reclutadores === 0) return null;
      const total_paginas = Math.ceil(total_reclutadores / limit);
      const [reclutadores] = await pool.query(
        `SELECT U.id AS id_usuario, R.id_reclutador, U.nombre, U.correo, U.genero, U.url_foto_perfil, E.id_empresa, E.nombre AS empresa
          FROM Reclutador R
          JOIN Usuario U ON R.id_usuario = U.id
          JOIN Empresa E ON R.id_empresa = E.id_empresa
          WHERE R.estado = 'Aprobado'
          ORDER BY R.id_reclutador
          LIMIT ? OFFSET ?`, [limit, offset]);
      
      const reclutadoresJson = {
        paginacion: {
          total_reclutadores: total_reclutadores,
          total_paginas: total_paginas,
          pagina_actual: page,
          tamano_pagina: limit
        },
        reclutadores: reclutadores
      };
      return reclutadoresJson;
    }catch(error){
      console.log('Error al obtener reclutadores: '+ (error.message|| error.sqlMessage));
      throw error;
    }
  }
}