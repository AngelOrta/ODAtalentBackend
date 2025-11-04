import Empresa from '../models/empresa.models.js'

export default class EmpresaController {
    static async obtenerEmpresas(req, res) {
        try{
            const empresas = await Empresa.obtenerEmpresas();
            if(!empresas) return  res.status(404).json({ error: 'No se encontraron empresas' });
            res.status(200).json(empresas);
        }catch(err){
            console.log(err);
            res.status(500).json({ error: 'Error al obtener empresas' });
        }
    }

    static async agregarEmpresa(req, res) {
        try{
            const { nombre, descripcion, url_logo, sitio_web} = req.body;
            const nuevaEmpresa = await Empresa.agregarEmpresa(nombre, descripcion, url_logo, sitio_web);
            if(!nuevaEmpresa) return res.status(400).json({ error: 'No se pudo agregar la empresa' });
            res.status(201).json(nuevaEmpresa);
        }catch(err){
            console.log(err);
            res.status(500).json({ error: 'Error al agregar empresa' });
        }
    }
}