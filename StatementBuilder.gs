/*
  This class builds a statement.
*/
var StatementBuilder = function() {
  this.account = null;
  this.csvFile = null;
  this.fromDate = null;
  
  this.buildStatement = function() {
    var csvString = this.csvFile.getBlob().getDataAsString();
    var csvArray = Utilities.parseCsv(csvString, ";").splice(1);
    
    var statement = new Statement();
        
    // Starts from the first row to avoid column headers.
    for(var i = 0; i < csvArray.length; i++) {      
      switch(this.account) {
        case "UBS_DEBIT":
          var transData = this._getUbsDebitTransactionData(csvArray[i]);
          break;
        case "UBS_CREDIT":
          var transData = this._getUbsCreditTransactionData(csvArray[i]);
          break;
        case "REVOLUT_DEBIT":
          var transData = this._getRevolutDebitTransactionData(csvArray[i]);
          break;
      };
      
      if(transData !== null 
         && transData.date > this.fromDate) {
        var transaction = new Transaction().builder
          .onDate(transData.date)
          .withDesc(transData.desc)
          .withDebit(transData.debit)
          .withCredit(transData.credit)
          .withBalance(transData.balance)
          .build();
        
        statement.addTransaction(transaction);
      }
    }

    return statement;
  }
  
  this._getUbsDebitTransactionData = function(row) {
    var transData = {};
    
    transData.balance = this._formatNumber(row[20]);
    transData.debit = this._formatNumber(row[18]);
    transData.credit = this._formatNumber(row[19]);
    
    if(transData.balance !== "" && 
       (transData.debit > 0 || transData.credit > 0)) {
      transData.date = this._formatDate(row[9]);
      transData.desc = row[13] + row[14];

      return transData;
    }
    
    return null;
  }
  
  this._getUbsCreditTransactionData = function(row) {
    var transData = {};
    
    var cardHolder = row[2];
    var cardNumber = row[1];
    var bookedDate = row[12];
    
    if(cardNumber !== "" && 
       bookedDate != "" && 
       cardHolder == "NICHOLAS HALL") {
      transData.date = this._formatDate(row[3]);
      transData.desc = row[4];
      transData.debit = this._formatNumber(row[10]);
      transData.credit = this._formatNumber(row[11]);
      transData.balance = transData.credit > 0 ? -Math.abs(transData.credit) : transData.debit;
      
      return transData;
    }
    
    return null;  
  }
  
  this._getRevolutDebitTransactionData = function(row) {
    var transData = {};
    transData.debit = row[2];
    transData.credit = row[3];
    transData.date = this._formatDate(row[0]);
    transData.desc = row[1];
    transData.balance = null; // Empty row
      
    return transData;
  }
  
  this._formatDate = function(dateString) {
    if(this.account == "REVOLUT_DEBIT") {
      var MONTHS_OF_YEAR = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];   
      var parts = dateString.split(" ");
      var year = parts[2];
      var month = MONTHS_OF_YEAR.indexOf(parts[1]);
      var day = parts[0];
      
      return new Date(year, month, day, 0, 0, 0, 0);

    } else {
      var year = dateString.substring(6);
      var month = dateString.substring(3, 5);
      var day = dateString.substring(0, 2);
    
      return new Date(year + "-" + month + "-" + day);
    }
  }

  this._formatNumber = function(str) {
    if(str == "") {
      return ''; 
    }
  
    return parseFloat(str.replace('\'', ''));
  }
  
  var Builder = function() {
    this.csvFile = null;
    this.account = null;
    this.fromDate = null;

    this.withCsvFile = function(csvFile) {
      this.csvFile = csvFile;
      return this;
    }
    
    this.ofAccount = function(account) {
      this.account = account;
      return this;
    }
    
    this.fromDate = function(fromDate) {
      this.fromDate = fromDate;
      return this;
    }
    
    this.build = function() {
      var statementBuilder = new StatementBuilder();
      statementBuilder.csvFile = this.csvFile;
      statementBuilder.account = this.account;
      statementBuilder.fromDate = this.fromDate;
      
      return statementBuilder;
    }
  }
  
  this.builder = new Builder();
}
