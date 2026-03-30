import express from "express";
import { Connection } from "../Connection.js";
import { Notification } from "../Notification.js";
import { scheduleEmailAndNotification, calcularFechaAlerta } from './funciones_notifications.js'
import { reminderQueue } from "../QueueConfig.js"

let Con = new Connection();
const router = express.Router();

// Obtener notificaciones por id
router.get("/api/notifications-by-user/:userId", async (req, res) => {
    const USER_ID = req.params.userId;
    const TOKEN = req.header('Authorization');
    const CALL = `/notifications/users/${USER_ID}`;

    let data = await Con.goGetFetcher(CALL, TOKEN);

    let notifications = data
    .filter(eachData => eachData.estado !== 1) 
    .map(eachData => {
        let notification = new Notification(
            eachData.idNotificacion,
            eachData.idUsuario,
            eachData.idRecordatorio,
            eachData.nombre,
            eachData.descripcion,
            eachData.fechaEmision
        );
        return notification.getData();
    });

    return res.json(notifications);
});

// Añadir notificaciones
router.post('/api/add-notification', async (req, res) =>{

    const ID_TO_DO = req.body.idToDoList;

    const TOKEN = req.header('Authorization');
    const CALL = `/notifications`;
    const DATA =  {
        idToDoList: ID_TO_DO,
        nombre: NAME,
        descripcion: DESC,
        fechaEmision: ISSUE_DATE
    };

    try {
        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);
        /*
        const RESULT = await Con.addNotification(
            ID_TO_DO,
            NAME,
            DESC,
            ISSUE_DATE
        );
*/
        return res.status(200).json({
            success: (RESULT != null),
            data: RESULT
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }

});

// Añadir notificaciones
router.post('/api/delete-notifications', async (req, res) =>{
    const ID_NOTIFICATIONS = req.body.ids;

    const TOKEN = req.header('Authorization');
    const CALL = `/deleteNotifications`;
    const DATA =  {
        ids: ID_NOTIFICATIONS
    };

    try {
        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);

        return res.status(200).json({
            success: (RESULT != null),
            data: RESULT
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Error interno del servidor"
        });
    }

});

//  -------------- ESTOS ENDPOINTS UTILIZAN EL REMINDERQUEUE

// Bloquear notificaciones temporalmente
router.post('/api/stop-all-notifications', async (req, res) => {
    try {
        const TOKEN = req.header('Authorization');
        const { codUsuario } = req.body;

        const AUTH  = await Con.goGetFetcher(`/users/${codUsuario}`, TOKEN);

        if (!AUTH){
            return res.status(401).json({ error: "Permiso denegado" });
        }

        // Validación de entrada
        if (!codUsuario) {
            return res.status(400).json({ error: "Falta el parámetro codUsuario en el cuerpo de la petición." });
        }

        console.log(`\nDETENIENDO NOTIFICACIONES: Usuario ${codUsuario} ---`);

        // Obtener los trabajos de la cola en diferentes estados
        const jobs = await reminderQueue.getJobs(['waiting', 'delayed', 'active']);

        let count = 0;

        for (const job of jobs) {
            const isUserJob = job.id.startsWith(`${codUsuario}-`) || 
			job.data.codUsuario == codUsuario;

            if (isUserJob) {
                try {
                    await job.remove();
                    count++;
                    console.log(`Eliminado Job ID: ${job.id}`);
                } catch (removeError) {
                    console.warn(`No se pudo eliminar el job ${job.id}: ${removeError.message}`);
                }
            }
        }

        console.log(`Limpieza terminada: ${count} tareas eliminadas para ${codUsuario} ---\n`);

        res.json({ 
            success: true, 
            message: `Se han cancelado tus ${count} notificaciones pendientes.`,
            detalles: {
                usuario: codUsuario,
                eliminados: count
            }
        });

    } catch (error) {
        console.error("ERROR CRÍTICO AL DETENER NOTIFICACIONES:", error);
        res.status(500).json({ 
            error: "Error interno del servidor al limpiar la cola de Redis.",
            detalle: error.message 
        });
    }
});

// Reanudar notificaciones
router.post('/api/restore-notifications', async (req, res) => {
    const { codUsuario } = req.body;
	const TOKEN = req.header('Authorization');

    try {
        
        if (!codUsuario) return res.status(400).json({ error: "Falta codUsuario" });

        console.log(`\nRESTAURACIÓN: Usuario ${codUsuario} ---`);

        // Datos del Usuario 
        //const user = await userData(codUsuario);
    
        const user = await Con.goGetFetcher(`/users/${codUsuario}`, TOKEN);
        
        if (!user){
            return res.status(400).json({ error: "El usuario no existe o el permiso fue denegado" });
        }

        // Datos de Go 
        //const rawReminders = await Con.getReminders(codUsuario);
        const rawReminders = await Con.goGetFetcher(`/reminders/users/${codUsuario}`, TOKEN);
        const reminders = Array.isArray(rawReminders) ? rawReminders : [];

        if (reminders.length === 0) {
            return res.status(404).json({ message: "Sin tareas para este usuario." });
        }

        let count = 0;
        const ahora = new Date();

        for (const r of reminders) {
            // Limpieza de datos
            const idToDo = r.N_idToDoList;
            const titulo = r.T_nombre;
            const desc = r.T_descripcion.Valid ? r.T_descripcion.String : "";
            const fechaRaw = r.Dt_fechaVencimiento.Valid ? r.Dt_fechaVencimiento.String : null;
            
            // Estados
            const isDeleted = r.B_isDeleted;
            const isPending = r.B_estado;

            if (!fechaRaw) continue;

            // LÓGICA DE TIEMPO 
            const fechaVencimiento = new Date(fechaRaw);
            const fechaAlerta = calcularFechaAlerta(fechaVencimiento, user[0].antelacionNotis);

            if (!isDeleted && !isPending && fechaAlerta > ahora) {
                
                console.log(`Agendando: "${titulo}" | Alerta: ${fechaAlerta.toLocaleString()}`);

                await scheduleEmailAndNotification(
                    idToDo,        
                    user[0].nombre,        
                    titulo,               
                    desc,               
                    fechaRaw,              
                    user[0].antelacionNotis, 
                    user[0].correo,           
                    codUsuario         
                );
                
                count++;
            } else {
                console.log(`Omitida: "${titulo}" (Alerta pasada o tarea inactiva)`);
            }
        }

        console.log(`TERMINADO: ${count} restaurados ---\n`);

        res.json({ 
            success: true, 
            message: `Sincronización exitosa.`, 
            total_restaurado: count 
        });

    } catch (error) {
        console.error("Error Crítico:", error.message);
        res.status(500).json({ error: "Fallo en la sincronización.", detalle: error.message });
    }
});

export default router;