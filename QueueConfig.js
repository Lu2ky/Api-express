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
    port: process.env.DB_ADDR_PORT_REDIS,
    password: process.env.DB_PASS_REDIS,
    maxRetriesPerRequest: null
};

// Crear la cola
const testQueue = new Queue('testConnection', { connection: redisConnection });

// Probar la conexión
testQueue.client.then((client) => {
    client.on('connect', () => {
        console.log('[Redis] Conexión establecida con éxito en:', redisConnection.host);
    });
    client.on('error', (err) => {
        console.error('[Redis] Error de conexión:', err.message);
    });
});

