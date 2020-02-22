function doGet(e) {
  let APP_HOME_HTML_FILE = "app";
  return HtmlService.createHtmlOutputFromFile(APP_HOME_HTML_FILE);
}

function getLatestThreeCsvFiles(accountName) {
  
  let account = new Account(accountName);
  let folder = DriveApp.getFolderById(account.getFolderId());
  let csvFiles = getLatestCsvFiles(folder, 3);
  let fileDetails = [];
  
  for(let i = 0; i < csvFiles.length; i++) {
    let csvFile = csvFiles[i];
    fileDetails.push({ 
      id: csvFile.getId(),
      date_created: dateToString(csvFile.getDateCreated()),
      name: csvFile.getName()
    });
  }
  
  return fileDetails;
}

function addStatementToSpreadsheet(accountName, fileId) {
  let account = new Account(accountName);
  let folder = DriveApp.getFolderById(account.getFolderId());
  let csvFile = DriveApp.getFileById(fileId);
  
  return addTransactionsToSpreadsheet(account, csvFile);
  
}

function dateToString(date) {
  return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}
