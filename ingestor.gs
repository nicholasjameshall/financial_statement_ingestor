function main() {
  this.REVOLUT_DEBIT = "REVOLUT_DEBIT";
  this.UBS_CREDIT = "UBS_CREDIT";
  this.UBS_DEBIT = "UBS_DEBIT";
  
  addLatestDataToSpreadsheet(this.UBS_DEBIT);
}

function addLatestDataToSpreadsheet(account) {  
  //this.SPREADSHEET_ID = "1L6wesda-6g387YV6A-45GuA-jiEyiRmpj3vIeyZs1EM"; // Real spreadsheet
  this.SPREADSHEET_ID = "1i5Ek4nX3NFexGuU0eHgM94-GHd0AskgaVNL6JEENLQw";
  
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
  var statement = new StatementBuilder(latestCsvFile, account)
    .buildStatement()
    .sort();
  
  if(statement.getNumTransactions() > 0) {
    sheet.insertRows(
      2, // Starting row
      statement.getNumTransactions() // Ending row
    ); 
  }
  
  var newRows = sheet.getRange(
    2, // Starting row
    1, // Starting column
    statement.getNumTransactions(), // Ending row
    8 // Ending column
  );

  newRows.setValues(statement.toArray());

}

/*
  Gets the latest file in .
*/
function getLatestCsvFile(folder) {
  var files = folder.getFiles();
  var fileDatesIds = [];
  
  while (files.hasNext()) {
    var file = files.next();
    if(file. getMimeType() == "text/csv") {
      fileDatesIds.push([file.getDateCreated(), file.getId()]);
    }
  }
  
  var latestCsvFileId = fileDatesIds.sort(UtilityClass.sortByDate)[0][1];
  var csvFile = DriveApp.getFileById(latestCsvFileId);
  return csvFile;
}

/*
  This class contains static utility functions for global use.
*/
var UtilityClass = function() {};
UtilityClass.sortByDate = function(a, b) {
    if (a.date === b.date) {
      return 0;
    }
    
    return (a.date < b.date) ? 1 : -1;
  }

/*
  This class represents a Statement.
*/
var Statement = function() {
  this.transactions = [];
  
  this.getNumTransactions = function() {
    return this.rows.length; 
  }
  
  this.addTransaction = function(row) {
    if(typeof row != 'undefined' && row !== null) {
      this.rows.push(row);
    }
  }
  
  this.toArray = function() {
    var rowArray = [];
    
    for (var i = 0; i < this.transactions.length; i++) {
      rowArray.push(this.transactions[i].toArray());
    }
    
    return rowArray;
  }
  
  this.sort = function() {
    this.rows = this.rows.sort(UtilityClass.sortByDate);
    return this;
  }
}

var Transaction = function() {
  this.date = null;
  this.month = null;
  this.desc = null;
  this.debit = null;
  this.credit = null;
  this.balance = null;
  
  this.toArray = function() {
    return [
      this.date,
      this.month,
      this.desc,
      "", // Blank for category
      "", // Blank for theme
      this.debit,
      this.credit,
      this.balance
    ];
  }

  var Builder = function() {
    this.date = null;
    this.month = null;
    this.desc = null;
    this.debit = null;
    this.credit = null;
    this.balance = null;

    this.onDate = function(dateString) {
      this.date = dateString;
      this.month = dateString.split("-").splice(0,2).join("-");
      return this;
    }

    this.withDesc = function(desc) {
      this.desc = desc;
      return this;
    }

    this.withDebit = function(debit) {
      this.debit = debit;
      return this;
    }

    this.withCredit = function(credit) {
      this.credit = credit;
      return this;
    }

    this.withBalance = function(balance) {
      this.balance = balance;
      return this;
    }

    this.build = function() {
      var transaction = new Transaction();
      transaction.date = this.date;
      transaction.month = this.month;
      transaction.desc = this.desc;
      transaction.debit = this.debit;
      transaction.credit = this.credit;
      transaction.balance = this.balance;
      return transaction;
    }
  }

  this.builder = new Builder();
}

var StatementBuilder = function(csvFile, account) {
  this.account = account;
  this.csvFile = csvFile;
  
  this.buildStatement = function() {
    var csvString = this.csvFile.getBlob().getDataAsString();
    var csvArray = Utilities.parseCsv(csvString, ";").splice(1);
    
    var statement = new Statement();
        
    // Starts from the first row to avoid column headers.
    for(var i = 0; i < csvArray.length; i++) {      
      switch(this.account) {
        case "UBS_DEBIT":
          var transaction = this._buildUbsDebitTransaction(csvArray[i]);
          break;
        case "UBS_CREDIT":
          var transaction = this._buildUbsCreditTransaction(csvArray[i]);
          break;
        case "REVOLUT_DEBIT":
          var transaction = this._buildRevolutDebitTransaction(csvArray[i]);
          break;
      };
      
      if(transaction !== null) {
        statement.addTransaction(transaction);
      }
    }

    return statement;
  }
  
  this._buildUbsDebitTransaction = function(row) {
    var balance = this._formatNumber(row[20]);
    var debit = this._formatNumber(row[18]);
    var credit = this._formatNumber(row[19]);
    
    if(balance !== "" && 
       (debit > 0 || credit > 0)) {
      var date = this._formatDate(row[9]);
      var desc = row[13] + row[14];
      
      var transaction = new Transaction().builder
        .onDate(date)
        .withDesc(desc)
        .withDebit(debit)
        .withCredit(credit)
        .withBalance(balance)
        .build();
      
      return transaction;
    }
    
    return null;

  }
  
  this._buildUbsCreditTransaction = function(row) {
    var cardHolder = row[2];
    var cardNumber = row[1];
    var bookedDate = row[12];
    
    if(cardNumber !== "" && 
       bookedDate != "" && 
       cardHolder == "NICHOLAS HALL") {
      var date = this._formatDate(row[3]);
      var desc = row[4];
      var debit = this._formatNumber(row[10]);
      var credit = this._formatNumber(row[11]);
      var sum = credit > 0 ? -Math.abs(credit) : debit;
      
      var transaction = new Transaction().builder
        .onDate(date)
        .withDesc(desc)
        .withDebit(debit)
        .withCredit(credit)
        .withBalance(sum)
        .build();
      
      return transaction;
    }
    
    return null;
    
  }
  
  this._buildRevolutDebitTransaction = function(row) {
    var debit = row[2];
    var credit = row[3];
    
    var date = this._formatDate(row[0]);
    var desc = row[1];
    var month = this._getMonthYearFromDate(date);    
      
    var transaction = new Transaction().builder
      .onDate(date)
      .withDesc(desc)
      .withDebit(debit)
      .withCredit(credit)
      .build();
      
    return transaction;
  }
  
  this._formatDate = function(dateString) {
    if(this.account == "REVOLUT_DEBIT") {
      var MONTHS_OF_YEAR = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];   
      var parts = dateString.split(" ");
      var year = parts[2];
      var month = MONTHS_OF_YEAR.indexOf(parts[1]) + 1;
      var day = parts[0];
      
      return year + "-" + month + "-" + day;

    } else {
      var year = dateString.substring(6);
      var month = dateString.substring(3, 5);
      var day = dateString.substring(0, 2);
    
      return year + "-" + month + "-" + day;

    }
  }

  this._formatNumber = function(str) {
    if(str == "") {
      return ''; 
    }
  
    return parseFloat(str.replace('\'', ''));
  } 
}
