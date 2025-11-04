// const Nodemailer = require("nodemailer");
// const { MailtrapTransport } = require("mailtrap");
import Nodemailer from "nodemailer";
import {MailtrapTransport} from "mailtrap";
import dotenv from 'dotenv';
dotenv.config();

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAIL_TOKEN,
  })
);

const sender = {
  address: "noreply@odatalent.com",
  name: "Eqipo de ODATalent",
};

export async function enviarCorreoBienvenidaReclutador(email, actionLink) {
    try {
        const info = await transport
        .sendMail({
            from: sender,
            to: email,
            subject: "¡Tu cuenta ha sido aprobada!",
            html: `
            <div style="font-family: Monserrat, sans-serif; line-height: 1.6; text-align: center;">
        <h1>¡Bienvenido a ODATalent!</h1>
        <p>Tu solicitud de registro ha sido aprobada.</p>
        <p>Por favor, haz clic en el siguiente enlace para crear tu contraseña:</p>
        
        <a href="${actionLink}" target="_blank" style="background-color: #007bff; color: #ffffff; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Crear mi contraseña
        </a>

        <div style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888; text-align: center;">
          <p>
            Si tienes problemas con el botón, copia y pega este enlace en tu navegador:
            <br>
            <a href="${actionLink}" style="color: #007bff; text-decoration: none;">${actionLink}</a>
          </p>
          <p>
            Visita nuestra <a href="https://www.odatalent.com" target="_blank" style="color: #007bff; text-decoration: none;">página web</a>.
          </p>
        </div>
        </div>
            `,
            
        })
        
        return { success: true, data: info };
    } catch (error) {
        console.log('Error al enviar correo de bienvenida: ' + error.message);
        return { success: false, error: error };
    }
}
