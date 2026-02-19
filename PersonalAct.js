import {Activity} from './Activity.js';

export class PersonalAct extends Activity{
    /*
    #desc = "";

    get desc(){
        return this.#desc;
    }*/

    id;
    desc;
    classroom;
    date_start;
    date_end;

    constructor(
        id,
        subject_name,
        desc,
        times,
        tag,
        date_start,
        date_end
    ) {
        super(id, subject_name, tag, times);

        this.desc = desc;
        this.date_start = date_start;
        this.date_end = date_end;
    }

    getData(){
        return {
            subject_name: this.name,
            desc: this.desc,
            times: this.times,
            Tag: this.tag,
            date_start: this.date_start,
            date_end: this.date_end
        }
    }
}