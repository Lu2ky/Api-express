export class Notification {
	#idNotification;
	#idUser;
	#idReminder;
	#name;
	#desc;
	#issueDate;
	#state;
	
	constructor(idNotification, idUser, idReminder, name, desc, issueDate){
		this.#idNotification = idNotification;
		this.#idUser = idUser;
		this.#idReminder = idReminder;
		this.#name = name;
		this.#desc = desc;
		this.#issueDate = issueDate;
	
	}

	constructor(idNotification, idUser, idReminder, name, desc, issueDate, state){
		this.#idNotification = idNotification;
		this.#idUser = idUser;
		this.#idReminder = idReminder;
		this.#name = name;
		this.#desc = desc;
		this.#issueDate = issueDate;
		this.#state = state;
	
	}

	getData(){
		return{
		N_idNotificacion: this.#idNotification,
		N_idUsuario: this.#idUser,
		N_idRecordatorio: this.#idReminder,
		T_nombre: this.#name,
		T_descripcion: this.#desc,
		Dt_fechaEmision: this.#issueDate,
		B_estado: this.#state
		
		}
	
	}

}