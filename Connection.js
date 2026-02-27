import dotenv from "dotenv";
import {fileURLToPath} from "url";
import {dirname, resolve} from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../config/expressapiconfig.env") });

export class Connection {
	constructor() {}

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

	// TO DO:

	//GET TAGS
	async GetTags() {
		let data;
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/GetTags"
			;
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

	//GET PERSONAL COMMENTS

	async GetPersonalComments(userId) {
		let data;
    const url =
        "http://" +
        process.env.API_ADDR +
        ":" +
        process.env.API_PORT +
        "/GetPersonalComments/" +
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

	//ADD PERSONAL COMMENT

	async addPersonalComment(
    N_idHorario,
    N_idUsuario,
    N_idCurso,
    Curso,
    T_comentario
) {

    const url =
        "http://" +
        process.env.API_ADDR +
        ":" +
        process.env.API_PORT +
        "/addPersonalComment";

    const data = {
        N_idHorario,
        N_idUsuario,
        N_idCurso,
        Curso,
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

//update personal comment

// UPDATE PERSONAL COMMENT

async updatePersonalComment(commentId, newComment) {

    const url =
        "http://" +
        process.env.API_ADDR +
        ":" +
        process.env.API_PORT +
        "/updatePersonalComment"; 

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

// DELETE PERSONAL COMMENT

async deletePersonalComment(commentId) {

    const url =
        "http://" +
        process.env.API_ADDR +
        ":" +
        process.env.API_PORT +
        "/deletePersonalComment"; 

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
}



