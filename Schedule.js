import {Activity} from './Activity.js';
import {Tag} from './Tag.js';

export class Schedule{
    #activities = [];
    
    constructor(){}

    addActivity(activity){ 
        this.#activities.push(activity);

    }

    editActivity(){}

    deleteActivity(){}
    
    filterActivity(keys){
        let filteredActivities = [];

        //Filtración de las id's solicitadas
        for(let ii = 0; ii < this.#activities.length; ii++){
            for(let jj = 0; jj < keys.length; jj++){
                if(this.#activities[ii].tagId == keys[jj]){
                    filteredActivities.push(this.#activities[ii]);

                }

            }

        }
        
        return filteredActivities;

        //Test temporal
        /*for(let kk = 0; kk < filteredActivities.length; kk++){
            console.log(filteredActivities[kk].name);
            
        }*/
        
    }

    //Get
    get activities(){
        return this.#activities;

    }

}