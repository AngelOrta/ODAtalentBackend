import {pool} from '../db/db.js';

export default class RolTrabajo {
  constructor(id_roltrabajo, nombre, area) {
    this.id_roltrabajo = id_roltrabajo;
    this.area = area;
    this.nombre = nombre;
  }

  static async obtenerTodos() {
    const [rows] = await pool.query('SELECT * FROM RolTrabajo');
    return rows.map(row => new RolTrabajo(row.id_roltrabajo, row.nombre, row.area));
  }

  static async crear(nombre) {
    const [result] = await pool.query('INSERT INTO RolTrabajo (nombre) VALUES (?)', [nombre]);
    return new RolTrabajo(result.insertId, nombre);
  }

  static async actualizar(id_roltrabajo, nombre) {
    await pool.query('UPDATE RolTrabajo SET nombre = ? WHERE id_roltrabajo = ?', [nombre, id_roltrabajo]);
    return new RolTrabajo(id_roltrabajo, nombre);
  }

  static async eliminar(id_roltrabajo) {
    const [result] = await pool.query('DELETE FROM RolTrabajo WHERE id_roltrabajo = ?', [id_roltrabajo]);
    return result.affectedRows > 0;
  }

  static async publicarArticulo(id_roltrabajo,id_admin, titulo, contenido) {
    try{
      const [result] = await pool.query(
      'INSERT INTO Articulo (id_roltrabajo, id_admin, titulo, contenido) VALUES (?, ?, ?, ?)',[id_roltrabajo,id_admin, titulo, contenido]);
      return result.insertId;
    }catch(error){
      console.error(error.sqlMessage);
      if(error.code === 'ER_NO_REFERENCED_ROW_2'){
        return null; // Rol de trabajo o admin no existen
      }
      throw error;
    }
  }
  
  static async editarArticulo(id_articulo, titulo, contenido) {
    try{
      const [result] = await pool.query(`UPDATE Articulo 
        SET titulo = ?, contenido = ? 
        WHERE id_articulo = ?`, [titulo, contenido, id_articulo]);
        if(result.info.includes('Rows matched: 0')){
          return null; // Articulo no existe
        }
        return true;
    }catch(error){
      throw new Error('Error al editar articulo: ' + error.sqlMessage);
    }
  }

  static async borrarArticulo(id_articulo) {
    try{
      const [result] = await pool.query('DELETE FROM Articulo WHERE id_articulo = ?', [id_articulo]);
      if(result.affectedRows === 0){
        return null; // Articulo no existe
      }
      return true;
    }catch(error){
      throw new Error('Error al borrar articulo: ' + error.sqlMessage);
    }
  }

  static async obtenerArticuloPorId(id_roltrabajo) {
    try{
      const [rows] = await pool.query('SELECT * FROM Articulo WHERE id_roltrabajo = ?', [id_roltrabajo]);
      if (rows.length === 0) {
        return null;
      }
      return rows;
    }catch(error){
      if(error.sqlMessage){
        throw new Error('Error al obtener articulo por id: ' + error.sqlMessage);
      }
    }
  }
}