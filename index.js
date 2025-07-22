#!/usr/bin/env node
import fs from 'fs';
import inquirer from 'inquirer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  MAIL_HOST: process.env.MAIL_HOST || 'smtp.example.com',
  MAIL_PORT: process.env.MAIL_PORT || 587,
  MAIL_AUTH_USER: process.env.MAIL_AUTH_USER || '',
  MAIL_AUTH_PASS: process.env.MAIL_AUTH_PASS || '',
  MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS || '',
  COACH_PHONE: process.env.PHONE || '',
  COACH_NAME: process.env.COACH_NAME || '',
}

const TEMPLATE_PATH = './assets/welcome_template.html';
const TEMP_HTML = './assets/temp_welcome.html';

// Paso 1: Preguntas al usuario
const questions = [
  {
    type: 'input',
    name: 'name',
    message: '📝 Ingresa el nombre completo del destinatario:',
  },
  {
    type: 'input',
    name: 'email',
    message: '📧 Ingresa el correo electrónico del destinatario:',
  },
  {
    type: 'list',
    name: 'gender',
    message: '⚧️  Selecciona el género:',
    choices: [
      { name: '👨 Hombre', value: '👨' },
      { name: '👩 Mujer', value: '👩' },
    ],
  },
];

 

inquirer.prompt(questions).then(({ name, email, gender }) => {
  const WELCOME_TEXT = gender === '👨' ? 'Bienvenido' : 'Bienvenida';

  // Paso 2: Lee y reemplaza en la plantilla
  let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  template = template
    .replace(/{{WELCOME_TEXT}}/g, WELCOME_TEXT)
    .replace(/{{NOMBRE}}/g, name)
    .replace(/{{EMOJI}}/g, gender)
    .replace(/{{COACH_PHONE}}/g, CONFIG.COACH_PHONE)
    .replace(/{{COACH_NAME}}/g, CONFIG.COACH_NAME);

  fs.writeFileSync(TEMP_HTML, template);

  const transporter = nodemailer.createTransport({
    host: CONFIG.MAIL_HOST,
    port: CONFIG.MAIL_PORT,
    secure: false,
    auth: {
      user: CONFIG.MAIL_AUTH_USER,
      pass: CONFIG.MAIL_AUTH_PASS,
    },
  });

  console.log('\n📤 Enviando correo...');
  transporter.sendMail({
    from: CONFIG.MAIL_FROM_ADDRESS,
    to: email,
    subject: `${WELCOME_TEXT} al equipo - ¡Aquí estoy para ayudarte desde el día uno!`,
    html: template,
  }, (error, info) => {
    fs.unlinkSync(TEMP_HTML);
    if (error) {
      console.error(`❌ Error al enviar el correo:\n${error.message}`);
    } else {
      console.log(`✅ Correo enviado a ${email} con éxito (${info.response})`);
    }
  });
});