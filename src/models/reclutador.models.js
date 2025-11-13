import {pool} from '../db/db.js';
import Vacante from './vacante.models.js';

export default class Reclutador {
  constructor(id_reclutador, nombre, correo, empresa, url_logo_empresa, estado, id_empresa, id_usuario) {
    this.id_reclutador = id_reclutador;
    this.nombre = nombre;
    this.correo = correo;
    this.empresa = empresa;
    this.url_logo_empresa = url_logo_empresa;
    this.estado = estado;
    this.id_empresa = id_empresa;
    this.id_usuario = id_usuario;
  }

  static async obtenerPorIdUsuario(idUsuario) {
    const [rows] = await pool.query('SELECT * FROM Reclutador WHERE id_usuario = ?', [idUsuario]);
    if (!rows.length) return null;
    return new Reclutador(rows[0].id_reclutador,null,null,null, rows[0].id_empresa, rows[0].id_usuario);
  }

  static async crearVacante(vacanteData) {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const existeVacante = await connection.query(
        'SELECT id_vacante FROM Vacante WHERE titulo = ? AND id_reclutador = ? AND monto_beca = ? AND ubicacion = ? AND ciudad = ? AND entidad = ? AND escolaridad = ? AND horario = ? AND modalidad = ? AND estado = ?',
        [vacanteData.titulo, vacanteData.id_reclutador, vacanteData.monto_beca, vacanteData.ubicacion, vacanteData.ciudad, vacanteData.entidad, vacanteData.escolaridad, vacanteData.horario, vacanteData.modalidad, 'Activa']
      );
      if (existeVacante[0].length) {
        return 'duplicada';
      }

      const [respuestaVacante] = await connection.query(
        `INSERT INTO Vacante 
        (id_reclutador, titulo, descripcion, beneficios, duracion, fecha_inicio, fecha_fin, monto_beca, horario, ubicacion, ciudad, entidad, codigo_postal, modalidad, fecha_limite, escolaridad, conocimientos, observaciones, numero_vacantes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vacanteData.id_reclutador,
          vacanteData.titulo,
          vacanteData.descripcion,
          vacanteData.beneficios,
          vacanteData.duracion,
          vacanteData.fecha_inicio,
          vacanteData.fecha_fin,
          vacanteData.monto_beca,
          vacanteData.horario,
          vacanteData.ubicacion,
          vacanteData.ciudad,
          vacanteData.entidad,
          vacanteData.codigo_postal,
          vacanteData.modalidad,
          vacanteData.fecha_limite,
          vacanteData.escolaridad,
          vacanteData.conocimientos,
          vacanteData.observaciones,
          vacanteData.numero_vacantes,
        ]
      );
      if (!respuestaVacante.affectedRows) {
        throw new Error('Error al crear la vacante');
      }
      const idNuevaVacante = respuestaVacante.insertId;

      if(vacanteData.habilidades.length > 0){
        const resultadoVacanteHabilidades = await connection.query(
          `INSERT INTO Vacante_Habilidad (id_vacante, id_habilidad) VALUES ?`,
          [vacanteData.habilidades.map(habilidad => [idNuevaVacante, habilidad.id_habilidad])]
        );
        if (!resultadoVacanteHabilidades[0].affectedRows) {
          throw new Error('Error al asociar habilidades a la vacante');
        }
      }

      if(vacanteData.roles_relacionados.length > 0){
        const resultadoVacanteRoles = await connection.query(
          `INSERT INTO Vacante_RolTrabajo (id_vacante, id_roltrabajo) VALUES ?`,
          [vacanteData.roles_relacionados.map(rol => [idNuevaVacante, rol.id_roltrabajo])]
        );
        if (!resultadoVacanteRoles[0].affectedRows) {
          throw new Error('Error al asociar roles a la vacante');
        }
      }

      await connection.commit();
      return idNuevaVacante;
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

  static async editarVacante(id_vacante, vacanteData) {
    let connection;
    try{
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const existeVacante = await connection.query(
        'SELECT id_vacante FROM Vacante WHERE id_vacante = ?',
        [id_vacante]
      );
      if (!existeVacante[0].length) {
        return false;
      }
      await connection.query(
          'DELETE FROM Vacante_Habilidad WHERE id_vacante = ?',
          [id_vacante]
        );
      await connection.query(
          'DELETE FROM Vacante_RolTrabajo WHERE id_vacante = ?',
          [id_vacante]
        );
      if(vacanteData.habilidades &&vacanteData.habilidades.length>0){
        const resultadoVacanteHabilidades = await connection.query(
          `INSERT INTO Vacante_Habilidad (id_vacante, id_habilidad) VALUES ?`,
          [vacanteData.habilidades.map(habilidad => [id_vacante, habilidad.id_habilidad])]
        );
        if (!resultadoVacanteHabilidades[0].affectedRows) {
          throw new Error('Error al asociar habilidades a la vacante');
        }
      }
      if(vacanteData.roles_relacionados && vacanteData.roles_relacionados.length > 0){
          const resultadoVacanteRoles = await connection.query(
            `INSERT INTO Vacante_RolTrabajo (id_vacante, id_roltrabajo) VALUES ?`,
            [vacanteData.roles_relacionados.map(rol => [id_vacante, rol.id_roltrabajo])]
          );
          if (!resultadoVacanteRoles[0].affectedRows) {
            throw new Error('Error al asociar roles a la vacante');
          }
      }

      await connection.query(
        `UPDATE Vacante SET 
          titulo = ?, descripcion = ?, beneficios = ?, duracion = ?, fecha_inicio = ?, fecha_fin = ?, monto_beca = ?, horario = ?, ubicacion = ?, ciudad = ?, entidad = ?, codigo_postal = ?, modalidad = ?, fecha_limite = ?, escolaridad = ?, conocimientos = ?, observaciones = ?, numero_vacantes = ?
        WHERE id_vacante = ?`,
        [
          vacanteData.titulo,
          vacanteData.descripcion,
          vacanteData.beneficios,
          vacanteData.duracion,
          vacanteData.fecha_inicio,
          vacanteData.fecha_fin,
          vacanteData.monto_beca,
          vacanteData.horario,
          vacanteData.ubicacion,
          vacanteData.ciudad,
          vacanteData.entidad,
          vacanteData.codigo_postal,
          vacanteData.modalidad,
          vacanteData.fecha_limite,
          vacanteData.escolaridad,
          vacanteData.conocimientos,
          vacanteData.observaciones,
          vacanteData.numero_vacantes,
          id_vacante
        ]
      );

      await connection.commit();
      return true;
    }catch(error){
      if (connection)
          await connection.rollback();
      console.log(error.message);
      throw error;
    }finally{
      if (connection)
        connection.release();
    } 
  }  

  static async obtenerVacantesPublicadas(id_reclutador) {
    const [rows] = await pool.query(
      `SELECT V.id_vacante, R.id_reclutador, V.titulo, V.fecha_publicacion, V.fecha_limite, V.numero_vacantes, V.ciudad, V.entidad, V.modalidad, V.estado, COUNT(P.id_postulacion) AS postulaciones
       FROM Vacante V 
       JOIN Reclutador R ON V.id_reclutador = R.id_reclutador
       LEFT JOIN Postulacion P ON V.id_vacante = P.id_vacante
       WHERE R.id_reclutador = ?
       GROUP BY V.id_vacante`,
      [id_reclutador]
    );
    if (!rows.length) return null;
    return rows.map(row => {
      return {
        id_vacante: row.id_vacante,
        id_reclutador: row.id_reclutador,
        titulo: row.titulo,
        fecha_publicacion: row.fecha_publicacion,
        fecha_limite: row.fecha_limite,
        numero_vacantes: row.numero_vacantes,
        ciudad: row.ciudad,
        entidad: row.entidad,
        modalidad: row.modalidad,
        estado: row.estado,
        postulaciones: row.postulaciones
      };
    });
  }

  static async obtenerPostulacionesVacante(id_vacante) {
    try {
      const vacanteData = await Vacante.obtenerDetallesVacante(id_vacante);
      if (!vacanteData) {
        return null;
      }
      const [postulacionesRows] = await pool.query(`SELECT P.id_postulacion, A.id_alumno, U.nombre, U.correo, U.url_foto_perfil, P.estatus
        FROM Postulacion P
        JOIN AlumnoSolicitante A ON P.id_alumno = A.id_alumno
        JOIN Usuario U ON A.id_usuario = U.id
        WHERE P.id_vacante = ?`, [id_vacante]);
      if (!postulacionesRows.length) {
        const vacanteConPostulaciones = {vacante:{...vacanteData}, postulaciones: []};
        return vacanteConPostulaciones;
      }
      const postulaciones = postulacionesRows.map(row => ({
        id_postulacion: row.id_postulacion,
        id_alumno: row.id_alumno,
        nombre: row.nombre,
        correo: row.correo,
        url_foto_perfil: row.url_foto_perfil,
        estatus: row.estatus
      }));

      const vacanteConPostulaciones = {vacante:{...vacanteData}, postulaciones: postulaciones};
      return vacanteConPostulaciones;
    }catch(error){
      console.log(error.message);
      throw error;
    }
  }

  static async obtenerPostulacionesEnRevisionPorIdAlumno(id_alumno, id_reclutador) {
    try {
      const [postulacionesRows] = await pool.query(`SELECT P.id_postulacion, P.id_alumno, P.id_vacante,R.id_reclutador, V.titulo, V.fecha_publicacion, V.fecha_limite, P.estatus
        FROM Postulacion P
        JOIN Vacante V ON P.id_vacante = V.id_vacante
        JOIN Reclutador R ON V.id_reclutador = R.id_reclutador
        WHERE P.id_alumno = ? AND R.id_reclutador = ? AND P.estatus = 'En revisión'`, [id_alumno, id_reclutador]);
      if(!postulacionesRows.length){
        return null;
      }
      const postulaciones = postulacionesRows.map(row => ({
        id_postulacion: row.id_postulacion,
        id_alumno: row.id_alumno,
        id_vacante: row.id_vacante,
        id_reclutador: row.id_reclutador,
        titulo: row.titulo,
        fecha_publicacion: row.fecha_publicacion,
        fecha_limite: row.fecha_limite,
        estatus: row.estatus
      }));
      return postulaciones;
    }catch(error){
      console.log(error.message);
      throw error;
    }
  }

  static async reclutarAlumno(id_postulacion, id_vacante, estatus) {
    let connection;
    try{
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const [resultado] = await connection.query(
        `UPDATE Postulacion SET estatus = ? WHERE id_postulacion = ? AND id_vacante = ?`,
        [estatus, id_postulacion, id_vacante]
      );
      if(resultado.info.includes('Rows matched: 0'))
        return null;
      //restar una vacante disponible si el estatus es 'Reclutado'
      const [resRestar]=await connection.query(
        `UPDATE Vacante SET numero_vacantes = numero_vacantes - 1 WHERE id_vacante = ? AND numero_vacantes > 0`,
        [id_vacante]
      );
      if(resRestar.affectedRows ===0 ){
        throw new Error('No hay vacantes disponibles');
      }
      const [verificarVacante] = await connection.query(
        `SELECT numero_vacantes FROM Vacante WHERE id_vacante = ?`,
        [id_vacante]
      );
      
      if(verificarVacante[0].numero_vacantes === 0){
        await connection.query(
          `UPDATE Vacante SET estado = 'Expirada' WHERE id_vacante = ?`,
          [id_vacante]
        );
        await connection.query( //rechazar todas las postulaciones restantes si ya no hay vacantes
          `UPDATE Postulacion SET estatus = 'Rechazado' WHERE id_vacante = ? AND estatus = 'En revisión'`,
          [id_vacante]
        );
      }
      await connection.commit();
      return resultado.affectedRows;
    }catch(error){
      if (connection)
          await connection.rollback();
      console.log(error.message);
      if(error.message === 'No hay vacantes disponibles'){
        return 'noVacantes';
      }
      throw error;
    }finally{
      if (connection)
        connection.release();
    }
  }

  static async rechazarPostulacionAlumno(id_postulacion) {
    const [resultado] = await pool.query(
      `UPDATE Postulacion SET estatus = 'Rechazado' WHERE id_postulacion = ?`,
      [id_postulacion]
    );
    if(resultado.info.includes('Rows matched: 0'))
      return null;
    return resultado.affectedRows;
  }

  static async obtenerAlumnosReclutados(id_reclutador) {
    const [rowsReclutado] = await pool.query(
      `SELECT U.id, A.id_alumno, P.id_postulacion, V.id_vacante, U.nombre, A.semestre_actual, U.url_foto_perfil, P.estatus, V.titulo AS nombre_vacante
       FROM Postulacion P
        JOIN AlumnoSolicitante A ON P.id_alumno = A.id_alumno
        JOIN Usuario U ON A.id_usuario = U.id
        JOIN Vacante V ON P.id_vacante = V.id_vacante
        JOIN Reclutador R ON V.id_reclutador = R.id_reclutador
        WHERE R.id_reclutador = ? AND P.estatus = 'Reclutado'`,[id_reclutador]);
    if (!rowsReclutado.length) return null;
    const alumnosIDs = rowsReclutado.map(r => r.id_alumno);
    const [habilidadesAlumnosRows] = await pool.query(
      `SELECT AH.id_alumno, AH.id_habilidad, H.categoria, H.tipo, H.habilidad
       FROM Habilidad H
        JOIN Alumno_Habilidad AH ON H.id_habilidad = AH.id_habilidad
        WHERE AH.id_alumno IN (?)`, [alumnosIDs]);
    const habilidadesPorAlumno = {};
    for (const id of alumnosIDs) {
      habilidadesPorAlumno[id] = [];
    }
    for (const skill of habilidadesAlumnosRows) {
      // separar el id_alumno del resto de los datos de la habilidad
      const { id_alumno, ...skillData } = skill;
      habilidadesPorAlumno[id_alumno].push(skillData);
    }
    const alumnosReclutados = rowsReclutado.map(row => ({
      id_usuario: row.id,
      id_alumno: row.id_alumno,
      id_postulacion: row.id_postulacion,
      id_vacante: row.id_vacante,
      nombre: row.nombre,
      semestre_actual: row.semestre_actual,
      habilidades: habilidadesPorAlumno[row.id_alumno],
      url_foto_perfil: row.url_foto_perfil,
      estatus: row.estatus,
      nombre_vacante: row.nombre_vacante
    }));
    return alumnosReclutados;
  }

  static async marcarPostulacionComoCompletada(id_postulacion) {
    const [resultado] = await pool.query(
      `UPDATE Postulacion SET estatus = 'Completado' WHERE id_postulacion = ?`,
      [id_postulacion]
    );
    if(resultado.info.includes('Rows matched: 0'))
      return null;
    return resultado.affectedRows;
  }

  static async cambiarEstadoVacante(id_vacante, estado) {
    if (!['Activa', 'Expirada'].includes(estado)) {
      throw new Error('Estado inválido');
    }
    const [resultado] = await pool.query('UPDATE Vacante SET estado = ? WHERE id_vacante = ?', [estado, id_vacante]);
    return resultado.affectedRows;
  }

  static async borrarVacante(id_vacante) {
    const [resultado] = await pool.query('DELETE FROM Vacante WHERE id_vacante = ?', [id_vacante]);
    return resultado.affectedRows;
  }

  static async obtenerPerfilReclutador(id_reclutador) {
    const [rows] = await pool.query(
      `SELECT R.id_reclutador, R.id_empresa, R.id_usuario, U.nombre, U.correo, U.url_foto_perfil, E.nombre AS nombre_empresa, E.url_logo AS url_logo_empresa, E.descripcion AS descripcion_empresa
      FROM Reclutador R
      JOIN Usuario U ON R.id_usuario = U.id
      JOIN Empresa E ON R.id_empresa = E.id_empresa
      WHERE R.id_reclutador = ?`, [id_reclutador]);
    if (!rows.length) return null;
    const rowsjson = {
        id_reclutador: rows[0].id_reclutador,
        id_empresa: rows[0].id_empresa,
        id_usuario: rows[0].id_usuario,
        nombre: rows[0].nombre,
        correo: rows[0].correo,
        url_foto_perfil: rows[0].url_foto_perfil};
    rowsjson.empresa = {
        id_empresa: rows[0].id_empresa,
        nombre_empresa: rows[0].nombre_empresa,
        url_logo_empresa: rows[0].url_logo_empresa,
        descripcion_empresa: rows[0].descripcion_empresa
    };
    return rowsjson;
  }

  static async actualizarFotoPerfil(id_reclutador, url_foto_perfil) {
    const [resultado] = await pool.query(
      `UPDATE Usuario U
       JOIN Reclutador R ON U.id = R.id_usuario
       SET U.url_foto_perfil = ?
       WHERE R.id_reclutador = ?`,
      [url_foto_perfil, id_reclutador]
    );
    return resultado.affectedRows;
  }
}