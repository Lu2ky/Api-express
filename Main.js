import {Activity} from './Activity.js';
import {Tag} from './Tag.js';
import {Schedule} from './Schedule.js';
import { officialAct } from './OfficialAct.js';

//Crear horario
let schedule = new Schedule();

//Crear etiquetas
let t1 = new Tag("Theory");
let t2 = new Tag("Art");
let t3 = new Tag("Laboratory");

//Asignar id etiquetas
t1.id = 1;
t1.id = 2;
t1.id = 3;

//Crear actividades
let a1 = new officialAct("a11", 1);
let a2 = new Activity("a2", 2);
let a3 = new Activity("a3", 3);
let a4 = new Activity("a4", 1);
let a5 = new Activity("a5", 2);

//Agregar actividades al horario
schedule.addActivity(a1);
schedule.addActivity(a2);
schedule.addActivity(a3);
schedule.addActivity(a4);
schedule.addActivity(a5);

//Filtrar etiquetas
schedule.filterActivity([1, 2]);

console.log(a1.time)