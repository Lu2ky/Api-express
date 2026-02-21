import {Activity} from "./Activity.js";
import {Tag} from "./Tag.js";
import {Schedule} from "./Schedule.js";
import {officialAct} from "./OfficialAct.js";
//prueba xd

const dateToNumber = (date) =>{
    
    let number = parseInt((date.slice(0, 5)).replace(":", ""));

    return number
};

let postData = {
    name: "DESCANSO",
    tag: "Personal",
    desc: "[DESC]",
    day: 1,
    startHour: "06:00:00",
    endHour: "08:00:00",
    idUser: 7,
    idAcademicPer: "[ID_ACADEMIC_PER]",
    times: [
        ["08:00:00", "09:00:00", 1],
        ["09:00:00", "10:40:00", 0],
        ["09:00:00", "10:00:00", 1]
    ]
}

console.log(dateToNumber(postData.endHour));
console.log(Activity.hasCollisions(postData.times, postData.startHour, postData.endHour, postData.day));

fetch('localhost:28523/api/add-personal/551542', {
    method: 'POST', // Specify the method
    headers: {
        'Content-Type': 'application/json', // Declare the content type
    },
    body: JSON.stringify(postData), // Convert the data object to a JSON string
})
;

/*
const between = (val, izq, der) => (val < Math.max(izq, der) && val > Math.min(izq, der));

console.log(between(1, 0, 3))

console.log(Activity.hasCollisions(data.times, data.startHour, data.endHour, data.day));
*/