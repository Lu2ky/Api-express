export class Tag {
    #id;
    #name = "";

    constructor(name){
        this.#name = name;

    }

    //Getters and setters
    get name(){
        return this.#name;
    
    }

    set name(name){
        this.#name = name;
    
    }

    get id(){
        return this.#id;
    }

    set id(id){
        this.#id = id;
    }

}