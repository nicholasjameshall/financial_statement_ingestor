class FileMetadata {
  constructor(id, dateCreated, name) {
    this.id = id;
    this.dateCreated = this._dateToString(dateCreated);
    this.name = name;
  }

  _dateToString(date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  }
}
