class GetLatestCsvFilesResponse {
  constructor(fileMetadataList){
    this.fileMetadataList = fileMetadataList;
  }

  serialize() {
    return JSON.stringify(this);
  }
}
