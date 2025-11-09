import {pool} from '../db/db.js';
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

  static async borrarVacante(id_vacante) {
    const [resultado] = await pool.query('DELETE FROM Vacante WHERE id_vacante = ?', [id_vacante]);
    return resultado.affectedRows;
  }
}