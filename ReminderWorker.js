import { Worker } from 'bullmq';
import { redisConnection } from './QueueConfig.js';
import { Connection } from './Connection.js'; 

const Con = new Connection();

const worker = new Worker('reminderQueue', async (job) => {
    console.log("\n[Worker] Ejecutando avisos");

    const { toDoId, userId, userCode, userName, title, content, dateStr, email, finalDateStr } = job.data;
    const FINAL_DATE = new Date(finalDateStr);
    
    // Contenido de email
    const emailData = {
        user: userName,
        horaFinal: FINAL_DATE.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        }),
        dia: FINAL_DATE.getDay() === 0 ? 7 : FINAL_DATE.getDay(),
        destinatario: email,
        actividad: title,
    };

    try {
    const response = await fetch(`http://${process.env.EMAIL_ADDR}:${process.env.EMAIL_PORT}/api/sendEmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(emailData)
    });

    const result = await response.json(); 

    if (response.ok) {
        console.log(`Correo aceptado por el servidor:`, result);
    } else {
        console.log(`El servidor de correo rechazó la petición:`, result);
    }
    } catch (err) {
        console.error("Error físico de red al contactar el servicio de correo:", err.message);
    }

    // Contenido de notificación
    const notiDate = {
        nombre: `Recordatorio: ${title}`,
        descripcion: content,
        fechaEmision: new Date().toLocaleString('sv-SE').replace('T', ' '),
        idToDoList: toDoId,
        N_idUsuario: userId,
        codUsuario: userCode
        
    };

    console.log("DATOS A ENVIAR:", JSON.stringify(notiDate, null, 2));

    try {
        const response = await fetch(`http://${process.env.API_ADDR}:${process.env.API_PORT}/api/v1/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
				"X-API-Key": process.env.API_KEY,
                'Connection': 'close'
            },
            body: JSON.stringify(notiDate)
        });
        
        const data = await response.json(); 
            
        if (!response.ok) {
            console.error("Error detallado del servidor:", data);
            throw new Error(`Servidor respondió: ${response.status} - ${data.error || response.statusText}`);
        }

        console.log("Notificación enviada correctamente");
    } catch (err) {
        console.error("Error notificación:", err.message);
    }

    const logEmailData =  {
        asunto: `Recordatorio: ${title}`, 
        contenido: content, 
        fechaEmision: dateStr, 
        idToDoList: toDoId
    };

    try {
        const response = await fetch(`http://${process.env.API_ADDR}:${process.env.API_PORT}/api/v1/emails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
				"X-API-Key": process.env.API_KEY,
                'Connection': 'close'
            },
            body: JSON.stringify(logEmailData)
        });

        const data = await response.json(); 
            
        if (!response.ok) {
            console.error("Error detallado del servidor:", data);
            throw new Error(`Servidor respondió: ${response.status} - ${data.error || response.statusText}`);
        }

        console.log("Log de correo enviado");
    } catch (err) {
        console.error("Error log de correo:", err.message);
    }

}, { connection: redisConnection });

