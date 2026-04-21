import { Connection } from "../Connection.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { reminderQueue } from '../QueueConfig.js'; 
import '../ReminderWorker.js';
import {} from 'express';

import modulo_official from './modulo_official.js';
import modulo_personal from './modulo_personal.js';
import modulo_comments from './modulo_comments.js';
import modulo_profile from './modulo_profile.js';
import modulo_reminders from './modulo_reminders.js';
import modulo_notifications from './modulo_notifications.js';
import modulo_auth from './modulo_auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//INTERCAMBIAR ESTAS DOS LINEAS SI SE QUIERE EJECUTAR EN LOCAL O SI SE SUBIRÁ A PRODUCCION

//dotenv.config(); //PROD
dotenv.config({path: resolve(__dirname, "../../../config/expressapiconfig.env")});	//LOCAL

const app = express();
const PORT = 28523;
app.use(cors());
app.use(express.json());

app.use("/", modulo_official);
app.use("/", modulo_personal);
app.use("/", modulo_comments);
app.use("/", modulo_profile);
app.use("/", modulo_reminders);
app.use("/", modulo_notifications);
app.use("/", modulo_auth);

// Revisar registros en la bd redis
app.get('/api/debug-redis', async (req, res) => {
    try {
        // Obtener conteos de BullMQ
        const counts = await reminderQueue.getJobCounts();
        
        // Obtener los últimos 10 trabajos agendados
        const delayedJobs = await reminderQueue.getDelayed(0, 10);
        
        res.json({
            resumen: counts,
            detalles_futuros: delayedJobs.map(j => ({
                id: j.id,
                data: j.data,
                timestamp: new Date(j.timestamp)
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Llamado al puerto
app.listen(PORT);





