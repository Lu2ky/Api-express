export class Reminder {
    #idToDoList;
    #idUser;
    #idReminder;
    #name;
    #descr;
    #dateExpir;
    #isDeleted;
    #priory;

    constructor(idToDoList, idUser, idReminder, name, descr, dateExpir, isDeleted, priory){
        this.#idToDoList = idToDoList;
        this.#idUser = idUser;
        this.#idReminder = idReminder;
        this.#name = name;
        this.#descr = descr;
        this.#dateExpir = dateExpir;
        this.#isDeleted = isDeleted;
        this.#priory = priory;  

    }

    getData(){
        return {
        N_idRecordatorio: this.#idReminder,
        T_nombre: this.#name,
        T_descripción: this.#descr,
        Dt_fechaVencimiento: this.#dateExpir,
        B_isDeleted: this.#isDeleted, 
        T_Prioridad: this.#priory,

    }
  }

}