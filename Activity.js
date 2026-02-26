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

    static hasCollisions(timesData, hStart, hEnd, day, dStart, dEnd){

        const between = (val, izq, der) => (val < Math.max(izq, der) && val > Math.min(izq, der));
        const dateToNumber = (date) => (parseInt((date.slice(0, 5)).replace(":", "")));

		/**
		 * TIMES structure:
		 * "times": [
         * "08:00:00", -- START_H
         * "09:40:00", -- END_H
         *  1 -- DAY
         *  "2026-02-21 00:00:00"
         *  "2026-03-05 23:59:00"
         * 
         * ],
		 */
        //SET ARGUMENTS TO NUMBERS
        const H_START = dateToNumber(hStart);
        const H_END = dateToNumber(hEnd)

        //for each activity time evaluate the collision
        console.log(timesData.length)

        for (let i = 0; i < timesData.length; i++) {

            const DATA_START_H = dateToNumber(timesData[i][0]);
            const DATA_END_H = dateToNumber(timesData[i][1]);
            const DATA_DAY = timesData[i][2];
            const DATA_START_D = new Date(timesData[i][3]);
            const DATA_END_D = new Date(timesData[i][2]);

            //console.log(DATA_DAY, DATA_START_H, DATA_END_H)

            //If the day isn't the same, ignore it
            if (DATA_DAY != day) continue;

            //If the time span it's the same, then a collision exists
            if (H_START == DATA_START_H && H_END == DATA_END_H) return true;

            //Is there a limit from the activity to add inside the time span of the activity currently being checked? 
            if (between(H_START, DATA_START_H, DATA_END_H) || between(H_END , DATA_START_H, DATA_END_H)) return true;
        }

        return false;
    }
}
