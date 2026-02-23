export class Reminder {
    #id;
    #name;
    #descr;
    #dateExpir;
    #isDeleted;
    #Priory;
    #tag;

    constructor(name, descripcion, fechaVencimiento){
        this.#name = name;
        this.#descr = descripcion;
        this.#dateExpir = fechaVencimiento;
        this.#isDeleted = false;  

    }

    getData(){
        return {
        N_idRecordatorio: this.#id,
        T_nombre: this.#name,
        T_descripción: this.#descr,
        Dt_fechaVencimiento: this.#dateExpir,
        B_isDeleted: this.#isDeleted, 
        T_Prioridad: this.#Priory,
        Etiqueta: this.#tag

    }
  }

}