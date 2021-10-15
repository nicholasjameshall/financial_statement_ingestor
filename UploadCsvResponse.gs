class UploadCsvResponse {
  constructor(numRowsAdded) {
    this.numRowsAdded = numRowsAdded;
  }

  serialize() {
    return JSON.stringify(this);
  }
}
