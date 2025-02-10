const nodemailer = require('nodemailer');

// Configuración de transporte de correo
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'mecg1994@gmail.com', // Tu correo Gmail
        pass: process.env.EMAIL_PASSWORD // Esta variable se configura en Vercel
    }
});

// Función principal que maneja la petición
module.exports = async (req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Manejar la solicitud OPTIONS para CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Verificar que sea una petición POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { pdfData, formData } = req.body;

        // Validar que existan los datos necesarios
        if (!pdfData || !formData) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        // Preparar el contenido del correo
        const mailOptions = {
            from: 'mecg1994@gmail.com',
            to: 'mecg1994@gmail.com',
            subject: 'Nuevo Formulario de Cliente Qualitech',
            html: `
                <h2>Nuevo Formulario Recibido</h2>
                <p><strong>Nombre:</strong> ${formData.primer_nombre} ${formData.apellido}</p>
                <p><strong>Email:</strong> ${formData.email}</p>
                <p><strong>Teléfono:</strong> ${formData.celular}</p>
                <p>El formulario completo se encuentra adjunto en formato PDF.</p>
            `,
            attachments: [
                {
                    filename: 'Formulario_Qualitech.pdf',
                    content: pdfData.split('base64,')[1],
                    encoding: 'base64'
                }
            ]
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        // Responder éxito
        res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully' 
        });

    } catch (error) {
        console.error('Error in send-form:', error);
        
        // Responder con error
        res.status(500).json({ 
            success: false, 
            error: 'Error sending email',
            details: error.message 
        });
    }
};