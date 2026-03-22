import { Activity } from "./Activity.js";

export class officialAct extends Activity {
    /*
    return {
      subject_name: OfficialActivity.name,
      professor_name: OfficialActivity.teacherName,
      classroom: OfficialActivity.place,
      NRC: OfficialActivity.NRC,
      times: OfficialActivity.time,
      Tag: OfficialActivity.tagId,
      academicPeriod: OfficialActivity.academicPeriod,
      Campus: OfficialActivity.Campus,
      Credits: OfficialActivity.credits,
    };
  */

  idHorario
  professor_name;
  classroom;
  NRC;
  Campus;
  Credits;
  startDate;
  endDate;

  constructor(
    idHorario,
    id,
    subject_name,
    professor_name,
    classroom,
    NRC,
    times,
    tag,
    Campus,
    Credits,
    startDate,
    endDate
  ) {
    super(id, subject_name, tag, times);
    this.idHorario = idHorario
    this.professor_name = professor_name;
    this.classroom = classroom;
    this.NRC = NRC;
    this.Campus = Campus;
    this.Credits = Credits;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  getData(){
    return {
      id_horario: this.idHorario,
      id_course: this.id,
      subject_name: this.name,
      professor_name: this.professor_name,
      classroom: this.classroom,
      NRC: this.NRC,
      times: this.times,
      tag: this.tag,
      campus: this.Campus,
      credits: this.Credits,
      date_start: this.startDate,
      date_end: this.endDate
    }
  }
}