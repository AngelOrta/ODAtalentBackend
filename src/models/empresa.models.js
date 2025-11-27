import {pool} from '../db/db.js';

export default class Empresa {
    constructor (id, nombre, descripcion, url_logo, sitio_web){
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.url_logo = url_logo;
        this.sitio_web = sitio_web;
    }

    static async agregarEmpresa(nombre, descripcion, urlLogo, sitio_web){
        try{    if(!urlLogo) urlLogo = null; if(!sitio_web) sitio_web = null;
            const [result] = await pool.query(
                'INSERT INTO Empresa (nombre, descripcion, url_logo, sitio_web) VALUES (?, ?, ?,?)', [nombre, descripcion, urlLogo, sitio_web]);
            if(!result.affectedRows) return null;
            //console.log(result.insertId);

            return { id_empresa: result.insertId}
        }
        catch(err){
            console.log(err.sqlMessage);
            if(err.code === 'ER_DUP_ENTRY'){
                throw new Error('La empresa ya existe');
            }
            throw err;
        }
    }

    static async obtenerEmpresas(){
        const [rows] = await pool.query('SELECT * FROM Empresa');
        if(!rows.length) return null;
        return rows.map(row => new Empresa(row.id_empresa, row.nombre, row.descripcion, row.url_logo, row.sitio_web));
    }

    static async actualizarEmpresa(id_empresa, nombre, descripcion, url_logo, sitio_web){
        try{
            console.log(id_empresa, nombre, descripcion, url_logo, sitio_web);
            const [result] = await pool.query(
                'UPDATE Empresa SET nombre = ?, descripcion = ?, url_logo = ?, sitio_web = ? WHERE id_empresa = ?',
                [nombre, descripcion, url_logo, sitio_web, id_empresa]
            );
            if(result.affectedRows === 0) return null;
            return { id_empresa: id_empresa };
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }

    static async eliminarEmpresa(id_empresa){
        try{
            const [result] = await pool.query(
                'DELETE FROM Empresa WHERE id_empresa = ?',
                [id_empresa]
            );
            if(result.affectedRows === 0) return null;
            return { id_empresa: id_empresa };
        }
        catch(err){
            console.log(err);
            throw err;
        }
    }
}