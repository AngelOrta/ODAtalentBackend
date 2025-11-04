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
        const [result] = await pool.query(
            'INSERT INTO Empresa (nombre, descripcion, url_logo, sitio_web) VALUES (?, ?, ?,?)', [nombre, descripcion, urlLogo, sitio_web]);
        if(!result.affectedRows) return null;
        return new Empresa(result[0].id_empresa, result[0].nombre, result[0].descripcion, result[0].url_logo, result[0].sitio_web);
    }

    static async obtenerEmpresas(){
        const [rows] = await pool.query('SELECT * FROM Empresa');
        if(!rows.length) return null;
        return rows.map(row => new Empresa(row.id_empresa, row.nombre, row.descripcion, row.url_logo));
    }

}