export class Reminder {
    #idToDoList;
    #idUser;
    #idReminder;
    #name;
    #descr;
    #dateExpir;
    #isDeleted;
    #priory;
    #state;

    constructor(idToDoList, idUser, idReminder, name, descr, dateExpir, isDeleted, priory, state){
        this.#idToDoList = idToDoList;
        this.#idUser = idUser;
        this.#idReminder = idReminder;
        this.#name = name;
        this.#descr = descr;
        this.#dateExpir = dateExpir;
        this.#isDeleted = isDeleted;
        this.#priory = priory;  
        this.#state = state;

    }

    getData(){
        if (!this.#isDeleted){
            return{
                N_idToDoList: this.#idToDoList,
                N_idUsuario: this.#idUser,
                N_idRecordatorio: this.#idReminder,
                T_nombre: this.#name,
                T_descripcion: this.#descr,
                Dt_fechaVencimiento: this.#dateExpir,
                B_isDeleted: this.#isDeleted, 
                T_Prioridad: this.#priory,
                B_estado: this.#state

            }

        }else{
            return null
        }
   }

}