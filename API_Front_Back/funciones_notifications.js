import { reminderQueue } from "../QueueConfig.js"

export async function scheduleEmailAndNotification(idToDo, userName, title, content, dateStr, advanceNotice, email, userCode) {

    // Lógica de fechas
    const isoStr = dateStr.replace(/\b(\d)\b/g, "0$1").replace(" ", "T");
    const FINAL_DATE = new Date(isoStr);
    const ALERT_DATE = calcularFechaAlerta(FINAL_DATE, advanceNotice);
    const NOW = new Date();

    const delay = ALERT_DATE.getTime() - NOW.getTime();

    if (delay > 0) {
        await reminderQueue.add('send-reminder', {
            idToDo, userCode, userName, title, content, dateStr, email,
            finalDateStr: FINAL_DATE.toISOString()
        }, {
			delay: delay,
            jobId: `${userCode}-${idToDo}`,
            removeOnComplete: true,
            removeOnFail: false
        });

        console.log(`[BullMQ] Recordatorio "${title}" agendada con ID: todo-${idToDo} (Faltan ${delay / 1000} seg).`);
    } else {
        console.log("La hora de aviso ya pasó. No se puede programar.");
    }
}
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