import dotenv from "dotenv";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: resolve(__dirname, "../../config/expressapiconfig.env")});

export class Connection {
	constructor() {}

	// Obtener horario oficial de estudiante
	async GetOfficialScheduleByUserId(id) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/GetOfficialScheduleByUserId/" +
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

	// Obteber horario personal de estudiante
	async GetPersonalScheduleByUserId(id) {
		let data;
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/GetPersonalScheduleByUserId/" +
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

	// Editar nombre de actividad personal
	async updateNameOfPersonalScheduleByIdCourse(
		newActivityValue,
		idPersonalSchedule
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/updateNameOfPersonalScheduleByIdCourse";

		const data = {
			NewActivityValue: newActivityValue,
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
				throw new Error(response.error || "No se q paso papu");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Editar decripción de actividad personal
	async updateDescriptionOfPersonalScheduleByIdCourse(
		newActivityValue,
		idPersonalSchedule
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/updateDescriptionOfPersonalScheduleByIdCourse";

		const data = {
			NewActivityValue: newActivityValue,
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
				throw new Error(response.error || "Me lleva el chanfle");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Editar hora de inicio de actividad personal
	async updateStartHourOfPersonalScheduleByIdCourse(
		newActivityValue,
		idPersonalSchedule
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/updateStartHourOfPersonalScheduleByIdCourse";

		const data = {
			NewActivityValue: newActivityValue,
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
				throw new Error(result.error || "Me lleva el chanfle");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
		}
	}

	// Editar hora de fin de actividad personal
	async updateEndHourOfPersonalScheduleByIdCourse(
		newActivityValue,
		idPersonalSchedule
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/updateEndHourOfPersonalScheduleByIdCourse";

		const data = {
			NewActivityValue: newActivityValue,
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
				throw new Error(result.error || "Me lleva el chanfle");
			}
		} catch (error) {
			console.error("Mira este error papu, que raro: ", error);
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
			"/deleteOrRecoveryPersonalScheduleByIdCourse";

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

	// Añadir actividad personal
	async addPersonalActivity(
		activity,
		description,
		day,
		startHour,
		endHour,
		n_iduser,
		id_academicperiod
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/addPersonalActivity";

		const data = {
			Activity: activity,
			Description: description,
			N_idTipoCurso: 7,
			Day: day,
			StartHour: startHour,
			EndHour: endHour,
			N_iduser: n_iduser,
			Id_AcademicPeriod: id_academicperiod
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

	// Obtener lista de etiquetas
	async GetTags() {
		let data;
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/GetTags";
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
	async GetReminders(id){
		const url = 
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/GetReminders/" + 
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
		state,
		tag1,
		tag2,
		tag3,
		tag4,
		tag5
	
	){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/addReminder";
	
		const data = {
			P_usuario: idUser,
			P_nombre: name,
			P_descripcion: desc,
			P_fecha: date,
			P_prioridad: priory,
			P_estado: state,
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
	async deleteReminder(
		idReminder
		
	) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/deleteOrRecoverReminder";

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
	async updateNameReminder(
		idToDo,
		newName
		
	){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/updateReminder";

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

	};

	// Actualizar descripción de recordatorio
	async updateDescReminder(
		idToDo,
		newDesc
		
	){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/updateReminder";

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

	};

	// Actualizar fecha de recordatorio
	async updateDateReminder(
		idToDo,
		newDate
		
	){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/updateReminder";

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

	};

	// Actualizar prioridad de recordatorio
	async updatePrioryReminder(
		idToDo,
		newPriory
		
	){
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/updateReminder";

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

	};

	// TO DO:

	// GET TAGS

	// GET PERSONAL COMMENTS

	// ADD PERSONAL COMMENT

	
}
