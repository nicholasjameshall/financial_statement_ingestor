function main() {
  this.REVOLUT_DEBIT = "REVOLUT_DEBIT";
  this.UBS_CREDIT = "UBS_CREDIT";
  this.UBS_DEBIT = "UBS_DEBIT";
  
  addLatestDataToSpreadsheet(this.UBS_CREDIT);
}

function addLatestDataToSpreadsheet(account) {  
  this.SPREADSHEET_ID = "1L6wesda-6g387YV6A-45GuA-jiEyiRmpj3vIeyZs1EM"; // Real spreadsheet
  //this.SPREADSHEET_ID = "1i5Ek4nX3NFexGuU0eHgM94-GHd0AskgaVNL6JEENLQw";
  
  this.UBS_DEBIT_SHEET_NAME = "UBS_DEBIT_CHF";
  this.UBS_CREDIT_SHEET_NAME = "UBS_CREDIT_CHF";
  this.REVOLUT_DEBIT_SHEET_NAME = "REVOLUT_DEBIT_CHF";

  this.UBS_DEBIT_FOLDER_ID = "1Gowp8Gn8UNVzak3NuujQjc_DY2xq2B9m";
  this.UBS_CREDIT_FOLDER_ID = "1b0sf4QY2KcarLK8vXz30a8Utk5L4QwTt";
  this.REVOLUT_DEBIT_FOLDER_ID = "1lkpOKLBN-HDN35o_omyIyAiv1V8KLiov";

  var spreadsheet = SpreadsheetApp.openById(this.SPREADSHEET_ID);
  var sheet;
  var folder;

  switch(account) {
    case "UBS_DEBIT":
      sheet = spreadsheet.getSheetByName(this.UBS_DEBIT_SHEET_NAME);
      folder = DriveApp.getFolderById(this.UBS_DEBIT_FOLDER_ID);
      break;
    case "UBS_CREDIT":
      sheet = spreadsheet.getSheetByName(this.UBS_CREDIT_SHEET_NAME);
      folder = DriveApp.getFolderById(this.UBS_CREDIT_FOLDER_ID);
      break;
    case "REVOLUT_DEBIT":
      sheet = spreadsheet.getSheetByName(this.REVOLUT_DEBIT_SHEET_NAME);
      folder = DriveApp.getFolderById(this.REVOLUT_DEBIT_FOLDER_ID);
      break;
  }
  
  var latestCsvFile = getLatestCsvFile(folder);
  var latestDate = getLatestDateInSheet(sheet);
        
  var statementBuilder = new StatementBuilder().builder
    .withCsvFile(latestCsvFile)
    .ofAccount(account)
    .fromDate(latestDate)
    .build();
  
  var statement = statementBuilder
    .buildStatement()
    .sort();
  
  if(statement.getNumTransactions() > 0) {
    sheet.insertRows(
      2, // Starting row
      statement.getNumTransactions() // Ending row
    ); 
  
    var newRows = sheet.getRange(
      2, // Starting row
      1, // Starting column
      statement.getNumTransactions(), // Ending row
      8 // Ending column
    );
  
    newRows.setValues(statement.toArray());
    
  } else {
    Logger.log("No new transactions found!"); 
  }

}

/*
  Gets the latest file in a folder.
*/
function getLatestCsvFile(folder) {
  var files = folder.getFiles();
  var fileDatesIds = [];
  
  while (files.hasNext()) {
    var file = files.next();
    if(file. getMimeType() == "text/csv") {
      fileDatesIds.push({
        'date': file.getDateCreated(),
        'id': file.getId()
      });
    }
  }
  
  var latestCsvFileId = fileDatesIds.sort(UtilityClass.sortByDate)[0]['id'];
  var csvFile = DriveApp.getFileById(latestCsvFileId);
  return csvFile;
}

/*
  Gets the latest transaction date in a sheet.
*/
function getLatestDateInSheet(sheet) {
  var rows = sheet.getRange("A:A").getValues();
  
  // Checks if second row empty
  if(rows[1][0] == "") {
    return null;
  } else {
    var mostRecentDate;
    
    for(var i = 1; i < rows.length; i++) {
      var currentDate = new Date(rows[i][0]);
      
      if(mostRecentDate == undefined) {
        mostRecentDate = currentDate;
      } else if(Date(currentDate) > mostRecentDate) {
        mostRecentDate = currentDate; 
      }
    }
      
    return mostRecentDate;
  }
}
