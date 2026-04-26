import { reminderQueue } from "../QueueConfig.js"

export async function scheduleEmailAndNotification(toDoId, reminderId, userId, userName, title, content, dateStr, advanceNotice, email, userCode) {

    // Lógica de fechas
    const isoStr = dateStr.replace(/\b(\d)\b/g, "0$1").replace(" ", "T");
    const FINAL_DATE = new Date(isoStr);
    const ALERT_DATE = calcularFechaAlerta(FINAL_DATE, advanceNotice);
    const NOW = new Date();

    const delay = ALERT_DATE.getTime() - NOW.getTime();

    if (delay > 0) {
        await reminderQueue.add('send-reminder', {
            toDoId, userId, userCode, userName, title, content, dateStr, email,
            finalDateStr: FINAL_DATE.toISOString()
        }, {
			delay: delay,
            jobId: `${userCode}-${reminderId}`,
            removeOnComplete: true,
            removeOnFail: false
        });

        console.log(`Recordatorio "${title}" agendada con ID: reminder-${reminderId} (Faltan ${delay / 1000} seg).`);
    } else {
        console.log("La hora de aviso ya pasó. No se puede programar.");
    }
}

// Eliminar notificación
export const deleteNotification = async (userCode, reminderId) => {
    try {
        const targetJobId = `${userCode}-${reminderId}`;
        const job = await reminderQueue.getJob(targetJobId);

        if (job) {
            await job.remove();
            console.log(`Recordatorio eliminado: ${targetJobId}`);
            return true;
        }
        
        console.log(`No se encontró el job ${targetJobId} (tal vez ya se envió).`);
        return false;
    } catch (error) {
        console.error(`Error al eliminar job ${userCode}-${reminderId}:`, error.message);
        throw error;
    }
};

//Calcula la fecha exacta de la notificación restando la antelación
export function calcularFechaAlerta(vencimiento, antelacion) {
    if (!antelacion || !antelacion.includes(':')) return vencimiento;
    
    const [h, m, s] = antelacion.split(':').map(Number);
    const alerta = new Date(vencimiento);
    
    alerta.setHours(alerta.getHours() - (h || 0));
    alerta.setMinutes(alerta.getMinutes() - (m || 0));
    alerta.setSeconds(alerta.getSeconds() - (s || 0));
    
    return alerta;
}

