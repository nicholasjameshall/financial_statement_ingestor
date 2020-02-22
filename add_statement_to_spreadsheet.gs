function addTransactionsToSpreadsheet(account, csvFile) {  
  //this.SPREADSHEET_ID = "1L6wesda-6g387YV6A-45GuA-jiEyiRmpj3vIeyZs1EM"; // Real spreadsheet
  this.SPREADSHEET_ID = "1i5Ek4nX3NFexGuU0eHgM94-GHd0AskgaVNL6JEENLQw";
  
  let spreadsheet = SpreadsheetApp.openById(this.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(account.getSheetName());  
  
  let mostRecentTransactionDate = getMostRecentTransactionDate(sheet);
  
  let statement = new Statement.Builder()
    .withCsvFile(csvFile)
    .ofAccount(account)
    .fromDate(mostRecentTransactionDate)
    .build();
  
  if(statement.getNumTransactions() > 0) {
    sheet.insertRows(
      2, // Starting row
      statement.getNumTransactions() // Ending row
    );
      
    let newRows = sheet.getRange(
      2, // Starting row
      1, // Starting column
      statement.getNumTransactions(), // Ending row
      8 // Ending column
    );
  
    newRows.setValues(statement.toArray());
    updateMainSheet(spreadsheet);
    
    return "SUCCESS";
    
  } else {
    return "NO_NEW_ROWS";
    
  }

}

function updateMainSheet(spreadsheet) {
  let ALL_CHF = "ALL_CHF";
  let REVOLUT_DEBIT_CHF = "REVOLUT_DEBIT_CHF";
  let UBS_DEBIT_CHF = "UBS_DEBIT_CHF";
  let UBS_CREDIT_CHF = "UBS_CREDIT_CHF";
  let PENSION_VIAC_3A_CHF = "PENSION_VIAC_3A_CHF";
  
  let targetSheet = spreadsheet.getSheetByName(ALL_CHF);
  let sourceSheets = [
    spreadsheet.getSheetByName(REVOLUT_DEBIT_CHF), 
    spreadsheet.getSheetByName(UBS_DEBIT_CHF), 
    spreadsheet.getSheetByName(UBS_CREDIT_CHF)
  ];
  
  let rows = getRowsFromSheets(sourceSheets);
  replaceRowsOfSheet(rows, targetSheet);
  
}

function replaceRowsOfSheet(rows, targetSheet) {
  let oldRangeNumRows = targetSheet.getRange("A:F").getNumRows();
  targetSheet.deleteRows(2, oldRangeNumRows - 2);
  targetSheet.insertRows(2, rows.length);
  let newRange = targetSheet.getRange(
    2, // starting row
    1,  // starting column
    rows.length, // ending row
    rows[0].length // ending column
  );
  
  newRange.setValues(rows);
  
}

function getRowsFromSheets(sheets) {
  let rows = [];
  
  for(let i = 0; i < sheets.length; i++) {
    let range = sheets[i].getRange("A:G").getValues();
    let sheetName = sheets[i].getName();
    
    for(let j = 1; j < range.length; j++) {
      let agg;
      
      if(range[j][5] > 0) {
        agg = range[j][5] - (range[j][5] * 2)
      } else {
        agg = range[j][6] 
      }
      
      rows.push([
        range[j][0], // date
        range[j][1], // month
        sheetName, // source
        range[j][3], // category
        range[j][5], // debit
        range[j][6], // credit
        agg
      ]);
    }
  }
  
  rows.sort(function(a, b){
    return new Date(b[0]) - new Date(a[0]);
  });
  
  return rows;
  
}

/*
  Gets the latest file in a folder.
*/
function getLatestCsvFiles(folder, quantity) {
  let files = folder.getFiles();
  let fileDatesIds = [];
  let quantityOfFiles = 0;
  let csvFiles = [];
  
  while (files.hasNext()) {
    this.quantityofFiles += 1;
    let file = files.next();
    if(file.getMimeType() == "text/csv") {
      fileDatesIds.push({
        'date': file.getDateCreated(),
        'id': file.getId()
      });
    }
  }
  
  if(quantity > fileDatesIds.length) {
    return "ERROR"; 
  } else {
    let sortedFileDatesIds = fileDatesIds.sort(UtilityClass.sortByDate);
    
    for(let i = 0; i < quantity; i++) {
      csvFiles.push(DriveApp.getFileById(sortedFileDatesIds[i]['id']));
    }
    
    return csvFiles;
  }
}

/*
  Gets the latest transaction date in a sheet.
*/
function getMostRecentTransactionDate(sheet) {
  let rows = sheet.getRange("A:A").getValues();
  
  // Checks if second row empty
  if(rows[1][0] == "") {
    return null;
  } else {
    let mostRecentDate;
    
    for(let i = 1; i < rows.length; i++) {
      let currentDate = new Date(rows[i][0]);
      
      if(mostRecentDate == undefined) {
        mostRecentDate = currentDate;
      } else if(Date(currentDate) > mostRecentDate) {
        mostRecentDate = currentDate; 
      }
    }
      
    return mostRecentDate;
  }
}
