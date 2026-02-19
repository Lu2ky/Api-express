export class Activity {
    id;
    name;
    tag;
    times;

    constructor(
        id,
        name,
        tag,
        times
    ){
        this.id = id;
        this.name = name;
        this.tag = tag;
        this.times = times;
    }
}