import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//{path: resolve(__dirname, "../../config/expressapiconfig.env")}
//dotenv.config();
dotenv.config({path: resolve(__dirname, "../../config/expressapiconfig.env")});

export class Connection {
  constructor() {}

  //	--------------------------------------- ACTIVIDADES -------------------------------------- \\

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
          "X-API-Key": process.env.API_KEY,
        },
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
      "/GetPersonalScheduleByUserId/" +
      id;
    try {
      const rta = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.API_KEY,
        },
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
      "/updatePersonalScheduleByIdCourse";

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
          "X-API-Key": process.env.API_KEY,
        },
        body: JSON.stringify(data),
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
    idPersonalSchedule,
  ) {
    const url =
      "http://" +
      process.env.API_ADDR +
      ":" +
      process.env.API_PORT +
      "/deleteOrRecoveryPersonalScheduleByIdCourse";

    const data = {
      IsDeleted: isDeleted,
      IdPersonalSchedule: idPersonalSchedule,
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
      "/addPersonalActivity";

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
          "X-API-Key": process.env.API_KEY,
        },
        body: JSON.stringify(data),
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
  async GetTiposCurso() {
    const url =
      "http://" +
      process.env.API_ADDR +
      ":" +
      process.env.API_PORT +
      "/GetTiposCurso/"
    try {
      const rta = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.API_KEY,
        },
      });
      if (!rta.ok) throw new Error(`Error: ${rta.status}`);
      const data = await rta.json();
      return data;
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

  // DELETE PERSONAL COMMENTS
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

  //	--------------------------------------- TAGS -------------------------------------- \\

	// Obtener lista de etiquetas
	async GetTagsByUserId(id) {
		const url =
			"http://" +
			process.env.API_ADDR +
			":" +
			process.env.API_PORT +
			"/GetTagsByUserId/" +
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
			"/GetTagsByUserIdAndReminderId/" +
			userId + "/" + courseId;
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
			"/deleteTag";
		try {
			const rta = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": process.env.API_KEY
				},
				body: JSON.stringify({ IdTag: idTag })
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
	async getReminders(id){
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
			"/updateReminder";

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
			"/updateReminder";

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

}
