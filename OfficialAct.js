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
  ) {
    super(id, subject_name, tag, times);
    this.idHorario = idHorario
    this.professor_name = professor_name;
    this.classroom = classroom;
    this.NRC = NRC;
    this.Campus = Campus;
    this.Credits = Credits;
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
      credits: this.Credits
    }
  }
}