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

  professor_name;
  classroom;
  NRC;
  academicPeriod;
  Campus;
  Credits;

  constructor(
    subject_name,
    professor_name,
    classroom,
    NRC,
    times,
    tag,
    academicPeriod,
    Campus,
    Credits
  ) {
    super(-1, subject_name, tag, times);

    this.professor_name = professor_name;
    this.classroom = classroom;
    this.NRC = NRC;
    this.academicPeriod = academicPeriod;
    this.Campus = Campus;
    this.Credits = Credits;
  }

  getData(){
    return {
      subject_name: this.name,
      professor_name: this.professor_name,
      classroom: this.classroom,
      NRC: this.NRC,
      times: this.times,
      Tag: this.tag,
      academicPeriod: this.academicPeriod,
      Campus: this.Campus,
      Credits: this.Credits
    }
  }
  /*
  #comments = [];
  #place = "";
  #teacherName = "";
  #teacherEmail = "";
  #academicPeriod = "";
  #credits = "";
  #ratingMethod = "";
  #level = "";
  #Campus = "";
  #NRC = "";

  //Definir los atributos obligatorios en el constructor
  constructor(name, tagId) {
    super(name, tagId);
  }

  //Getters and setters
  get comments() {
    return this.#comments;
  }

  get place() {
    return this.#place;
  }

  set place(place) {
    this.#place = place;
  }

  get teacherName() {
    return this.#teacherName;
  }

  set teacherName(teacherName) {
    this.#teacherName = teacherName;
  }

  get teacherEmail() {
    return this.#teacherEmail;
  }

  set teacherEmail(teacherEmail) {
    this.#teacherEmail = teacherEmail;
  }

  get academicPeriod() {
    return this.#academicPeriod;
  }

  set academicPeriod(academicPeriod) {
    this.#academicPeriod = academicPeriod;
  }

  get credits() {
    return this.#credits;
  }

  set credits(credits) {
    this.#credits = credits;
  }

  get ratingMethod() {
    return this.#ratingMethod;
  }

  set ratingMethod(ratingMethod) {
    this.#ratingMethod = ratingMethod;
  }

  get level() {
    return this.#level;
  }

  set level(level) {
    this.#level = level;
  }

  get Campus() {
    return this.#Campus;
  }

  set Campus(campus) {
    this.#Campus = campus;
  }

  set NRC(nrc) {
    this.#NRC = nrc;
  }
  get NRC() {
    return this.#NRC;
  }
    */
}