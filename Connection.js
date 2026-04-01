import dotenv from "dotenv";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import bcrypt from "bcrypt";

//dotenv.config();	//PROD
dotenv.config({path: resolve(__dirname, "../../config/expressapiconfig.env")});	//LOCAL

const API_ADDR = process.env.API_ADDR
const API_PORT = process.env.API_PORT

// Para que ejecute una instancia local de la API de Go
//const API_ADDR = "localhost";
//const API_PORT = "8080";

export class Connection {
	constructor() {}

	//	--- Fetcher --- //
	async goGetFetcher(service, token = null) {

		const URL = `http://${API_ADDR}:${API_PORT}/api/v1${service}`//"http://" + API_ADDR + ":" + API_PORT + service;
		console.log(API_ADDR);
		console.log(API_PORT);
		console.log(service);
		console.log(URL);

		try {
			const rta = await fetch(URL, {
				method: "GET",
				headers: {
					"Authorization": token,
					"X-API-Key": process.env.API_KEY
				}
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}, ${rta.text()}`);
			const RESPONSE = await rta.json();
			console.log(RESPONSE);

			return RESPONSE;
		} catch (error) {

			console.error("ERROR EN LA CONEXION:", error);
		}
	}

	async goPostFetcher(service, bodyData, token = null) {
		
		const URL = `http://${API_ADDR}:${API_PORT}/api/v1${service}`
		console.log(URL)
		console.log(bodyData)

		try {
			const rta = await fetch(URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": token,
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(bodyData)
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}, ${rta.text()}`);

			const RESPONSE = await rta.json();
			return RESPONSE;

		} catch (error) {

			console.error("ERROR EN LA CONEXION:", error);
		}
	}
}
	//	--------------------------------------- ACTIVIDADES -------------------------------------- \\
/*
	// Obtener horario oficial de estudiante
	async GetOfficialScheduleByUserId(id, token) {
		const CALL = `/GetOfficialScheduleByUserId/${id}`;
		
		try {
			const RESPONSE = goGetFetcher(CALL, token);
			return RESPONSE
		} catch (error) {
			console.log(error);
		}
		

		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/schedules/official/users/" +
			id;
		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});
			if (!rta.ok) throw new Error(`Error: ${rta.status}`);
			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Obtener horario personal de estudiante
	async GetPersonalScheduleByUserId(id) {
		let data;
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/schedules/personal/users/" +
			id;
		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});
			if (!rta.ok) throw new Error(`Error: ${rta.status}`);
			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	//  Actualizar actividad personal
	async updatePersonalActivity(
		idCurso,
		nombreCurso,
		descripcion,
		fechaInicio,
		fechaFin,
		dia,
		horaInicio,
		horaFin
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/schedules/personal/update";

		const data = {
			P_idCurso: idCurso,
			P_nombreCurso: nombreCurso,
			P_descripcion: descripcion,
			P_fechaInicio: fechaInicio,
			P_fechaFin: fechaFin,
			P_dia: dia,
			P_horaInicio: horaInicio,
			P_horaFin: horaFin
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status == 200) {
				return send;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("ERROR :sob: ", error);
		}
	}

	// Eliminar actividad personal
	async deleteOrRecoveryPersonalScheduleByIdCourse(
		isDeleted,
		idPersonalSchedule
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/schedules/personal/delete-or-recover";

		const data = {
			IsDeleted: isDeleted,
			IdPersonalSchedule: idPersonalSchedule
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status == 200) {
				return send;
			} else {
				throw new Error(response.error);
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	//  agregar actividad personal
	async addPersonalActivity(
		usuario,
		nombreCurso,
		descripcion,
		fechaInicio,
		fechaFin,
		dia,
		horaInicio,
		horaFin,
		periodo
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/schedules/personal";

		const data = {
			P_usuario: usuario,
			P_nombreCurso: nombreCurso,
			P_descripcion: descripcion,
			P_fechaInicio: fechaInicio,
			P_fechaFin: fechaFin,
			P_dia: dia,
			P_horaInicio: horaInicio,
			P_horaFin: horaFin,
			P_periodo: periodo
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status == 200) {
				return send;
			} else {
				throw new Error(response.error || "Me lleva el chanfle");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Obtener los tipos de cursos disponibles
	async GetTiposCurso(token) {
		const CALL = `/GetTiposCurso`;
		
		try {
			const RESPONSE = goGetFetcher(CALL, token);
			return RESPONSE
		} catch (error) {
			console.log(error);
		}

		
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/course-types";
		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});
			if (!rta.ok) throw new Error(`Error: ${rta.status}`);
			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
		
	}

	// Obtener los periodos académicos disponibles
	async GetAcademicPeriods() {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/academic-periods"
		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});
			if (!rta.ok) throw new Error(`Error: ${rta.status}`);
			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// PARA REVISAR LAS COLISIONES
	async GetTimesData(user, day){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/schedules/activities/times";

		const data ={
			idUsuario: user,
			dia: day
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status === 200) {
				return response;
			} else {
				throw new Error(response.error || "Error agregando comentario");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	//	--------------------------------------- COMENTARIOS -------------------------------------- \\
	async GetPersonalComments(userId) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/comments/personal/users/" +
			userId;

		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}`);

			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	async GetPersonalCourseComments(userId, courseId) {
		
		const CALL = "/GetPersonalCourseComments/${userId}/${courseId}";

		this.goGetFetcher(CALL, "1");

		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/comments/personal/users/" +
			userId +
			"/courses/" +
			courseId;

		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}`);

			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	//ADD PERSONAL COMMENT

	async addPersonalComment(
		N_idHorario,
		T_comentario
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/comments/personal";

		const data = {
			N_idHorario,
			T_comentario
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status === 200) {
				return response;
			} else {
				throw new Error(response.error || "Error agregando comentario");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// UPDATE PERSONAL COMMENT
	async updatePersonalComment(commentId, newComment) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/comments/personal/update";

		try {
			const rta = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify({
					N_idComentarios: commentId,
					T_comentario: newComment
				})
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}`);

			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// DELETE PERSONAL COMMENTS
	async deletePersonalComment(commentId) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/comments/personal/delete";

		try {
			const rta = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify({
					N_idComentarios: commentId
				})
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}`);

			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	//	--------------------------------------- TAGS -------------------------------------- \\

	// Obtener lista de etiquetas
	async GetTagsByUserId(id) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/tags/users/" +
			id;
		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});
			if (!rta.ok) throw new Error(`Error: ${rta.status}`);
			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	//GET TAGS BY USERID AND COURSE

	async GetTagsByUserAndCourse(userId, courseId) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/tags/users/" +
			userId +
			"/reminders/" +
			courseId;
		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});
			if (!rta.ok) throw new Error(`Error: ${rta.status}`);
			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	//DELATE TAG

	async DeleteTag(idTag) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/tags/delete";
		try {
			const rta = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify({IdTag: idTag})
			});
			if (!rta.ok) throw new Error(`Error: ${rta.status}`);
			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	//	--------------------------------------- RECORDATORIOS -------------------------------------- \\

	// Obtener lista de recordatorios
	async getRemindersTags(id){
		const url = 
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders/users/" +
			id +
			"/tags";

		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}`);

			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Obtener lista de recordatorios
	async getReminders(id){
		const url = 
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders/users/" +
			id;

		try {
			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}`);

			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Añadir recordatorio
	async addReminder(
		idUser,
		name,
		desc,
		date,
		priory,
		tag1,
		tag2,
		tag3,
		tag4,
		tag5
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders";

		const data = {
			P_usuario: idUser,
			P_nombre: name,
			P_descripcion: desc,
			P_fecha: date,
			P_prioridad: priory,
			P_tag1: tag1,
			P_tag2: tag2,
			P_tag3: tag3,
			P_tag4: tag4,
			P_tag5: tag5
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});
			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "Me lleva el chanfle");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Eliminar recordatorio
	async deleteReminder(idReminder) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders/delete-or-recover";

		const data = {
			N_idRecordatorio: idReminder
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status == 200) {
				return send;
			} else {
				throw new Error(response.error);
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Actualizar nombre de recordatorio
	async updateNameReminder(idToDo, newName) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders/update";

		const data = {
			P_idToDo: idToDo,
			P_nombre: newName
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});
			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Actualizar descripción de recordatorio
	async updateDescReminder(idToDo, newDesc) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders/update";

		const data = {
			P_idToDo: idToDo,
			P_descripcion: newDesc
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});
			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Actualizar fecha de recordatorio
	async updateDateReminder(idToDo, newDate) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders/update";

		const data = {
			P_idToDo: idToDo,
			P_fecha: newDate
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});
			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Actualizar prioridad de recordatorio
	async updatePrioryReminder(idToDo, newPriory) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders/update";

		const data = {
			P_idToDo: idToDo,
			P_prioridad: newPriory
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});
			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Actualizar estado de recordatorio
	async updateStateReminder(
		idToDo,
		newState
		
	){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders/update";

		const data = {
			P_idToDo: idToDo,
			P_estado: newState
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});
			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}

	};

	// Actualizar etiquetas de recordatorio
	async updateTagsReminder(
		idToDo,
		newTag1,
		newTag2,
		newTag3,
		newTag4,
		newTag5
		
	){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/reminders/update";

		const data = {
			P_idToDo: idToDo,
			P_tag1: newTag1,
			P_tag2: newTag2,
			P_tag3: newTag3,
			P_tag4: newTag4,
			P_tag5: newTag5

		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});
			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}

	};

//	--------------------------------------- NOTIFICACIONES -------------------------------------- \\

	// Obtener notificaciones
	async getNotifications(id){
		const url = 
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/notifications/users/" + 
			id;

		try {

			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}`);

			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}

	}
	
	// Agregar notificación
	async addNotification(
		idToDo,
		name,
		desc,
		issueDate
	
	){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/notifications";
	
		const data = {
			idToDoList: idToDo,
			nombre: name,
			descripcion: desc,
			fechaEmision: issueDate

		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "Me lleva el chanfle");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}

	}

	// Actualizar descripción de recordatorio
	async configNotifications(id, mail, time_mute, phone) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/notifications/mute";

		const data = {
			idUsuario: id,
			correo: mail,
			antelacionNotis: time_mute,
			telefono: phone
		};

		try {
			console.log("Enviando a Go:", JSON.stringify(data));
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Agregar correo
	async addEmail(
		idToDo,
		issue,
		content,
		issueDate
	){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/emails";
	
		const data = {
			idToDoList: idToDo,
			asunto: issue,
			contenido: content,
			fechaEmision: issueDate

		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "Me lleva el chanfle");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}

	}

	// Obtener notificaciones
	async getUserData(id){
		const url = 
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/users/" + 
			id;

		try {

			const rta = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});

			if (!rta.ok) throw new Error(`Error: ${rta.status}`);

			const data = await rta.json();
			return data;
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}

	}

//	--------------------------------------- IMPORTAR HORARIO -------------------------------------- \\

	async importSchedule (name, semester, program, codeUser, nrc, courseName, 
		teacher, credits, rateMode, campus, courseType, day, startTime, 
		endTime, lounge, academicPeriod){
			const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/schedules/import";

		const data = {
			nombre: name,
			semestre: semester,
			programa: program,
			codUsuario: codeUser,
			nrc: nrc,
			nombreCurso: courseName,
			docente: teacher,
			creditos: credits,
			modoCalificar: rateMode,
			campus: campus,
			tipoCurso: courseType,
			dia: day,
			horaInicio: startTime,
			horaFin: endTime,
			salon: lounge,
			periodoAcademico: academicPeriod
		};

		
		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}

	}


	
//	------------------------ FUNCIONALIDADES DEL LDAP ------------------------ //

	async adduser(user, pass) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/auth/users";
		const encoder = new TextEncoder();
    	const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(pass));
    	const hashedPass = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

		const data = {
			User: user,
			Pass: hashedPass
		};
		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});
			const response = await send.json();
			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se que paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, q raro: ", error);
		}
	}
	
	async authuser(user, pass) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/auth/login";
		const encoder = new TextEncoder();
    	const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(pass));
    	const hashedPass = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

		const data = {
			User: user,
			Pass: hashedPass
		};
		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
			});
			const response = await send.json();
			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se que paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, q raro: ", error);
		}
	}

	async userinfo(user) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/users/" + user;
		try {
			const send = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				}
			});
			const response = await send.json();
			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se que paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, q raro: ", error);
		}
	}

    async changepassword(user, pass) {
		const url =
		"http://" +
		process.env.API_ADDR +
		":" +
		process.env.API_PORT +
		"/api/v1/auth/change-password";
		const encoder = new TextEncoder();
        	const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(pass));
        	const hashedPass = Array.from(new Uint8Array(hashBuffer))
        	.map(b => b.toString(16).padStart(2, "0"))
        	.join("");
		const data = {
		user: user,
		pass: hashedPass,
		};
		try {
		const send = await fetch(url, {
			method: "POST",
			headers: {
			"Content-Type": "application/json",
			"X-API-Key": process.env.API_KEY,
			},
			body: JSON.stringify(data),
		});
		const response = await send.json();
		if (send.status == 200) {
			return response;
		} else {
			throw new Error(response.error || "No se que paso papu");
		}
		} catch (error) {
		console.error("Mira este error papu, q raro: ", error);
		throw error;
		}
	}


	async adduseradmin(user, pass) {
		const url =
		"http://" +
		process.env.API_ADDR +
		":" +
		process.env.API_PORT +
		"/api/v1/auth/admins";
		const encoder = new TextEncoder();
    	const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(pass));
    	const hashedPass = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

		const data = {
		User: user,
		Pass: hashedPass,
		};
    try {
		const send = await fetch(url, {
		method: "POST",
			headers: {
			"Content-Type": "application/json",
			"X-API-Key": process.env.API_KEY,
			},
			body: JSON.stringify(data),
		});
	const response = await send.json();
	if (send.status == 200) {
		return response;
	} else {
		throw new Error(response.error || "No se que paso papu");
	}
	} catch (error) {
	console.error("Mira este error papu, q raro: ", error);
	}
	}

	//	------------------------ Camabiar contraseña  ------------------------ //

	async receiveTokenData(userId, token) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/tokens";

		const data = {
			userId: userId,
			token: token
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
				"Content-Type": "application/json",
				"X-API-Key": process.env.API_KEY,
				},
				body: JSON.stringify(data)
			});

			const response = await send.json();

			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
			throw error;
		}
	}

	async getToken(userId, token){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/api/v1/tokens/get";

		const data = {
			userId: userId,
			token: token
		};

		try {
			const send = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify(data)
				
			});

			const response = await send.json();
			console.log("respuesta", response);
			if (send.status == 200) {
				return response;
			} else {
				throw new Error(response.error || "No se que paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, q raro: ", error);
		}
		
	}

	//	------------------------ LOGS  ------------------------ //

async addLog(usuario_id, accion, descripcion) {
	const url =
	"http://" +
	process.env.API_ADDR +
	":" +
	process.env.API_PORT +
	"/addLog";
	
	const data = {
		usuario_id,
		accion,
		descripcion
	};

	try {
		const send = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": process.env.API_KEY
			},
			body: JSON.stringify(data)
		});

		const response = await send.json();

		if (send.status == 200) {
			return response;
		} else {
			throw new Error(response.error || "Error al insertar log");
		}

	} catch (error) {
		console.error("Error en addLog:", error);
	}
}

}

*/