import { Connection } from "../Connection.js";
let Con = new Connection();

export function validatePasswordPolicy(password) {
	const value = String(password || "");

	if (value.length < 8) {
		return "La contraseña debe tener al menos 8 caracteres";
	}

	if (!/[a-z]/.test(value)) {
		return "La contraseña debe incluir al menos una letra minúscula";
	}

	if (!/[A-Z]/.test(value)) {
		return "La contraseña debe incluir al menos una letra mayúscula";
	}

	if (!/\d/.test(value)) {
		return "La contraseña debe incluir al menos un número";
	}

	if (!/[^A-Za-z0-9\s]/.test(value)) {
		return "La contraseña debe incluir al menos un símbolo";
	}

	return null;
}

// Guardar token en la base de datos y enviar email
export const saveTokenAndSendEmail = async (userId, token, userName, email) => {
    try {
        // Guardar token en la base de datos
        //console.log("user:", userId, " token:", token)
        //await Con.receiveTokenData(userId, token); 
        //console.log("Token guardado correctamente.");
        const CALL = `/tokens`;
        const DATA = {
            userId: userId,
			token: token
        }

        await Con.goPostFetcher(CALL, DATA); 

        // Estructura de correo
        const emailData = {
            user: userName,
            token: token,
            minutos: "15",
            destinatario: email,
        };

        // Envío de correo
        console.log(`Enviando correo a ${email}...`);
        
        const emailResponse = await fetch("http://" + process.env.EMAIL_ADDR + ":" + process.env.EMAIL_PORT + "/api/sendEmailToken", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });

        if (!emailResponse.ok) {
            const errorDetail = await emailResponse.json().catch(() => ({}));
            throw new Error(errorDetail.message || "Servidor de correo rechazó la solicitud");
        }

        console.log(`Correo enviado con éxito a ${email}!`);

    } catch (error) {
        console.error("Hubo un fallo en el proceso:", error.message);
    }

};

export async function hashPassword (password){

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(password));
    const hashedPass = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    return hashedPass;
}