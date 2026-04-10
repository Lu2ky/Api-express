import { Queue } from 'bullmq'; 
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, "../../config/expressapiconfig.env") }); 

export const redisConnection = {
    host: process.env.DB_ADDR_REDIS, 
    port: parseInt(process.env.DB_ADDR_PORT_REDIS),
    password: process.env.DB_PASS_REDIS,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
    
};

export const reminderQueue = new Queue('reminderQueue', { connection: redisConnection });

reminderQueue.client.then(async (client) => {
    try {
        // Al tener password, este 'ping' debería devolver 'PONG'
        const respuesta = await client.ping();
        console.log("--- RESULTADO DE AUTENTICACIÓN ---");
        if (respuesta === 'PONG') {
            console.log("¡CONTRASEÑA CORRECTA! Conexión total establecida.");
            
            // Opcional: Probar escritura
            await client.set('auth_test', 'Exito');
            console.log("Escritura permitida.");
        }
    } catch (error) {
        console.error("ERROR DE AUTENTICACIÓN:", error.message);
        console.log("Tip: Revisa que DB_PASSWORD_REDIS en tu .env sea la correcta.");
    }
});