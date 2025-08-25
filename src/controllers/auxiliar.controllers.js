import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

export default class AuxiliarController {
  static async verificarQR(req, res) {
    const url = req.query.url;

    //Verificar que la URL tenga el formato correcto
    const regex = /^https:\/\/www\.dae\.ipn\.mx\/vcred\/?/;

    if (!regex.test(url)) {
      return res.status(400).json({ mensaje: 'URL inválida. No coincide con el formato esperado.' });
    }

    try {
      //Agente HTTPS que ignore verificación de certificado
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false
      });

      //Obtener el HTML de la URL
      const response = await axios.get(url,{ httpsAgent });
      const html = response.data;

      const $ = cheerio.load(html);
      //Verificar que el contenido del div carrera sea el esperado
      const carreraTexto = $('div.carrera').text().trim();

      if (carreraTexto === 'INGENIERÍA EN SISTEMAS COMPUTACIONALES') {
        return res.status(200).json({ mensaje: 'QR verificado correctamente' });
      } else {
        return res.status(400).json({ mensaje: 'La carrera no coincide con la esperada.' });
      }

    } catch (error) {
      console.error('Error al verificar QR:', error.message);
      return res.status(500).json({ mensaje: 'Error al procesar la URL.' });
    }
  }
}