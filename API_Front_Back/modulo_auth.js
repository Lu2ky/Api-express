import express from "express";
import { validatePasswordPolicy, saveTokenAndSendEmail, hashPassword } from "./funciones_auth.js"
import { Connection } from "../Connection.js";

let Con = new Connection();
const router = express.Router();

// --------------------------------------- AUTENTICACIÓN DE USUARIO ------------------------------------

router.post("/api/auth/create-user", async (req, res) => {
	const USER = req.body.user;
	const PASS = req.body.pass;

    const hashedPass = await hashPassword(PASS)

    const TOKEN = req.header('Authorization');
    const CALL = `/auth/users`;

    const DATA = {
        User: USER,
		Pass: hashedPass
    }

	try {
        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);
		//const RESULT = await Con.adduser(USER, PASS);
		const success = RESULT != undefined;

		return res.status(200).json({
			success: success
		});
	} catch (error) {
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});
//  Este endpoint ya existe en el modulo_profile, qué wea??
/*
router.get("/api/auth/userdata/:id", async (req,res) => {
	const ID = req.params.id;
	try {
		const RESULT = await Con.getUserData(ID);
		return res.status(200).json({
			success: true,
			data: RESULT
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
});
*/
router.post("/api/auth/validate-user", async (req, res) => {
	const USER = req.body.user;
	const PASS = req.body.pass;

    const hashedPass = await hashPassword(PASS)
    const CALL = `/auth/login`;

    const DATA = {
        User: USER,
		Pass: hashedPass
    }

	try {
        const RESULT = await Con.goPostFetcher(CALL, DATA);
		//const RESULT = await Con.authuser(USER, PASS);
		const success = RESULT != undefined;

		return res.status(200).json({
			success: success,
			jwt_token: RESULT.Token,
			role: RESULT.UserAuth.Roles
		});
	} catch (error) {
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}

});

router.post("/api/auth/add-admin", async (req, res) => {
	const USER = req.body.user;
	const PASS = req.body.pass;

    const hashedPass = await hashPassword(PASS)

    const TOKEN = req.header('Authorization');
    const CALL = `/auth/admins`;

    const DATA = {
        User: USER,
		Pass: hashedPass
    }

	try {
        const RESULT = await Con.goPostFetcher(CALL, DATA, TOKEN);
		//const RESULT = await Con.adduseradmin(USER, PASS);
		const success = RESULT != undefined;
		return res.status(200).json({
		    success: success,
		});
	} catch (error) {
		return res.status(500).json({
		    error: "Error interno del servidor",
		});
	}
});

router.post("/api/auth/changepassword", async (req, res) => {
	const USER = req.body.user;
	const PASS = req.body.pass;

	if (!USER || !PASS) {
		return res.status(400).json({
			success: false,
			message: "user y pass son obligatorios"
		});
	}


	const policyError = validatePasswordPolicy(PASS);
	if (policyError) {
		return res.status(400).json({
			success: false,
			message: policyError
		});
	}

    const hashedPass = await hashPassword(PASS)

    //const TOKEN = req.header('Authorization');
    const CALL = `/auth/change-password`;

    const DATA = {
        User: USER,
		Pass: hashedPass
    }

	try {
		//const RESULT = await Con.changepassword(USER, PASS);
        const RESULT = await Con.goPostFetcher(CALL, DATA)//, TOKEN)

		if (!RESULT) {
			return res.status(502).json({
				success: false,
				message: "No se recibio respuesta valida del servicio LDAP"
			});
		}

		return res.status(200).json({
			success: true,
			message: RESULT.message || "Contraseña cambiada correctamente"
		});

	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || "Error interno del servidor"
		});
	}
});

// --------------------------------------- ENVIO DE TOKEN ------------------------------------

router.post('/api/send-code', async (req, res) => {
    const USER_CODE = req.body.codUsuario;
    const CALL = `/users/${USER_CODE}`

    try {
        
        const RESPONSE_USERDATA = await Con.goGetFetcher(CALL);
 /*       
        const url = `http://${process.env.API_ADDR}:${process.env.API_PORT}/api/v1/users/${USER_CODE}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                "X-API-Key": process.env.API_KEY
            }
        });
*/
        const jsonResponse = await RESPONSE_USERDATA.json();
        const USER_DATA = jsonResponse[0];

        console.log(USER_DATA);
        
        if (!USER_DATA || !USER_DATA.idUsuario) {
            console.log("Respuesta de API sin datos de usuario:", jsonResponse);
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const USER_ID = USER_DATA.idUsuario.toString();
        const USER_NAME = USER_DATA.nombre || "Usuario";
        const CLIENT_EMAIL = USER_DATA.correo;

        // Generar token
        const TOKEN = Math.floor(100000 + Math.random() * 900000).toString();

        await saveTokenAndSendEmail(
            USER_ID,    
            TOKEN, 
            USER_NAME,            
            CLIENT_EMAIL
        );

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error en send-code:", error.message);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Validar token
router.post('/api/validate-token', async (req, res) =>{
    const USER_TOKEN = req.body.token;
    const USER_ID = req.body.userId.toString();

    const CALL = `tokens/get`;
    const DATA = {
        userId: USER_ID,
        token: USER_TOKEN
    };
    
    try {
        // Consultar token en la base de datos
        const RESPONSE = await Con.goPostFetcher(CALL, DATA); 
        const userId = RESPONSE.userId;

        // Si userId NO es null el token es válido
        if (userId) {
            console.log("Token válido para el usuario:", userId);
            
            return res.status(200).json({ 
                success: true, 
                message: "Token encontrado",
                userId: userId 
            });
        } else {
            console.log("El token no existe o ya expiró.");
    
            return res.status(401).json({ 
                success: false, 
                message: "Token inválido o expirado" 
            });
        }

    } catch (error) {
        console.error("Hubo un fallo en el proceso:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "Error interno del servidor" 
        });
    }

});

export default router;