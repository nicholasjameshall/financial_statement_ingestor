function main() {
  addCsvDataToSpreadsheet("REVOLUT_DEBIT");
}

function addCsvDataToSpreadsheet(statementType) { 
  var csvHandler = new CsvHandler(statementType);
  var csv = csvHandler.findLatestCsv().getParsedCsv();
  
  var spreadsheetHandler = new SpreadsheetHandler();
  var sheet;
  
  switch(statementType) {
    case "UBS_DEBIT":
      sheet = spreadsheetHandler.getUbsDebitSheet();
      break;
    case "UBS_CREDIT":
      sheet = spreadsheetHandler.getUbsCreditSheet();
      break;
    case "REVOLUT_DEBIT":
      sheet = spreadsheetHandler.getRevolutDebitSheet();
      break;
  }
  
  sheet.insertData(csv);
}

/*
  This class handles all operations related to the finances spreadsheet.
  It takes no arguments.
*/
var SpreadsheetHandler = function() {
  this.SPREADSHEET_ID = "1i5Ek4nX3NFexGuU0eHgM94-GHd0AskgaVNL6JEENLQw";
  this.UBS_DEBIT_SHEET_NAME = "UBS_DEBIT_CHF";
  this.UBS_CREDIT_SHEET_NAME = "UBS_CREDIT_CHF";
  this.REVOLUT_DEBIT_SHEET_NAME = "REVOLUT_DEBIT_CHF";
  this.spreadsheet = SpreadsheetApp.openById(this.SPREADSHEET_ID);
  
  this.getRevolutDebitSheet = function() {
    return new SheetHandler(this.spreadsheet.getSheetByName(this.REVOLUT_DEBIT_SHEET_NAME));
  }
  
  this.getUbsDebitSheet = function() {
    return new SheetHandler(this.spreadsheet.getSheetByName(this.UBS_DEBIT_SHEET_NAME));
  }
  
  this.getUbsCreditSheet = function() {
    return new SheetHandler(this.spreadsheet.getSheetByName(this.UBS_CREDIT_SHEET_NAME));
  }
};

/*
  This class handles all operations related to individual sheets within a spreadsheet.
  It takes a sheet as an argument.
*/
var SheetHandler = function(sheet) {
  this.sheet = sheet;
  
  this.insertData = function(csv) {
    this.sheet.insertRows(2, csv.length);
    var newRange = this.sheet.getRange(
      2, // Starting row
      1, // Starting column
      csv.length, // Num rows
      csv[0].length // Num columns
    );
    
    newRange.setValues(csv);
  }  
}

/*
  This class handles all operations related to individual CSVs.
  It takes a CSV statement type as an argument.
*/
var CsvHandler = function(statementType) {
  this.UBS_DEBIT_FOLDER_ID = "1Gowp8Gn8UNVzak3NuujQjc_DY2xq2B9m";
  this.UBS_CREDIT_FOLDER_ID = "1b0sf4QY2KcarLK8vXz30a8Utk5L4QwTt";
  this.REVOLUT_DEBIT_FOLDER_ID = "1lkpOKLBN-HDN35o_omyIyAiv1V8KLiov";
  
  this.statementType = statementType;
  this.csvData;
  this.csvParsed = [];
  
  this.findLatestCsv = function() {
    var folder;
    
    switch(this.statementType) {
      case "UBS_DEBIT":
        folder = DriveApp.getFolderById(this.UBS_DEBIT_FOLDER_ID);
        break;
      case "UBS_CREDIT":
        folder = DriveApp.getFolderById(this.UBS_CREDIT_FOLDER_ID);
        break;
      case "REVOLUT_DEBIT":
        folder = DriveApp.getFolderById(this.REVOLUT_DEBIT_FOLDER_ID);
    }
    
    var files = folder.getFiles();
    var fileDatesIds = [];
    
    while (files.hasNext()) {
      var file = files.next();
      fileDatesIds.push([file.getDateCreated(), file.getId()]);
    }
    
    var latestCsvFileId = fileDatesIds.sort(this._sortByDate)[0][1];
    var csvFile = DriveApp.getFileById(latestCsvFileId);
    var csvString = csvFile.getBlob().getDataAsString();
    this.csvData = Utilities.parseCsv(csvString, ";").splice(1);
    return this;
  }
  
  this.getParsedCsv = function() {
    for(var i = 0; i < this.csvData.length; i++) {
      switch(this.statementType) {
        case "UBS_DEBIT":
          var row = this._parseUbsDebitRow(i);
          break;
        case "UBS_CREDIT":
          var row = this._parseUbsCreditRow(i);
          break;
        case "REVOLUT_DEBIT":
          var row = this._parseRevolutDebitRow(i);
          break;
      };
      
      if(row.length !== 0) {
        this.csvParsed.push(row); 
      }
    }
    
    return this.csvParsed.sort(this._sortByDate);        
  }
  
  this._parseUbsDebitRow = function(i) {
    var balance = this._formatNumber(this.csvData[i][20]);
    var debit = this._formatNumber(this.csvData[i][18]);
    var credit = this._formatNumber(this.csvData[i][19]);
    
    if(balance !== "" && debit !== 0 && credit !== 0) {
      var date = this._formatDate(this.csvData[i][9]);
      var desc = this.csvData[i][13] + this.csvData[i][14];
      var month = this._getMonthYearFromDate(date);
      
      return [ date, month, desc, "", "", debit, credit, balance ];
    }
    
    return [];
  }
  
  this._parseUbsCreditRow = function(i) {
    var cardNumber = this.csvData[i][1];
    var bookedDate = this.csvData[i][12];
    
    if(cardNumber !== "" && bookedDate != "" && i !== 0) {
      var debit = this._formatNumber(this.csvData[i][10]);
      var credit = this._formatNumber(this.csvData[i][11]);
      var date = this._formatDate(this.csvData[i][3]);
      var desc = this.csvData[i][4];
      var month = this._getMonthYearFromDate(date);
      var sum = credit > 0 ? -Math.abs(credit) : debit;
      
      return [ date, month, desc, "", "", debit, credit, sum ];
    }
    
    return [];
  }
  
  this._parseRevolutDebitRow = function(i) {
    var balance = this.csvData[i][6];
    var debit = this.csvData[i][2];
    var credit = this.csvData[i][3];
    
    var date = this._formatDate(this.csvData[i][0]);
    var desc = this.csvData[i][1];
    var month = this._getMonthYearFromDate(date);    
      
    return [ date, month, desc, "", "", debit, credit ];
  }
  
  this._sortByDate = function(a, b) {
    if (a[0] === b[0]) {
      return 0;
    }
    
    return (a[0] < b[0]) ? 1 : -1;
  }
  
  this._formatDate = function(dateString) {
    if(this.statementType == "UBS_DEBIT" || this.statementType == "UBS_CREDIT") {
      var year = dateString.substring(6);
      var month = dateString.substring(3, 5);
      var day = dateString.substring(0, 2);
    
      return year + "-" + month + "-" + day;
    } else if(this.statementType == "REVOLUT_DEBIT") {
      var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];   
      var parts = dateString.split(" ");
      var year = parts[2];
      var month = MONTHS.indexOf(parts[1]) + 1;
      var day = parts[0];
      
      return year + "-" + month + "-" + day;
    }
  }
  
  this._getMonthYearFromDate = function(dateString) {
    return dateString.split("-").splice(0,2).join("-");
  }

  this._formatNumber = function(numString) {
    if(numString == "") {
      return ''; 
     }
  
     return parseFloat(numString.replace('\'', ''));
  }
  
}
