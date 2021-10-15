/*
  This class represents a new statement to be merged with the finance spreadsheet.
*/
class Statement {
  constructor() {
    this.account;
    this.transactions = [];
  }

  addTransaction(row) {
    if(typeof row != 'undefined' && row !== null) {
      this.transactions.push(row);
    }
  }
  
  toArray() {
    return this.transactions.map(transaction => 
      transaction.toArray()
    );
  }

  removeDuplicateTransactions(sheet) {
    let newTransactions = this.transactions;
    let savedTransactions = sheet
      .getRange(
        2,
        1,
        sheet.getLastRow(),
        sheet.getLastColumn()
      ).getValues();
    
    let savedTransactionsByDate = {};
    
    for(const transaction of savedTransactions) {
      let trans = new Transaction.Builder()
        .setDate(new Date(transaction[0]))
        .setSource(transaction[1])
        .setDesc(transaction[2])
        .setCategory(transaction[3])
        .setValue(transaction[5])
        .build();
      
      let date = trans.dateString;
      
      if(!(date in savedTransactionsByDate)) {
        savedTransactionsByDate[date] = [trans.value]; 
      } else {
        savedTransactionsByDate[date].push(trans.value); 
      }
    }
    
    let eligibleTransactions = [];
    
    for(const transaction of newTransactions) {
      let date = transaction.dateString;
      
      if(date in savedTransactionsByDate) {     
        if(!(savedTransactionsByDate[date].includes(transaction.value))) {
          eligibleTransactions.push(transaction);
        }
      } else {
        eligibleTransactions.push(transaction); 
      }
    }
    
    this.transactions = eligibleTransactions;
  }
  
  static get Builder() {
    class Builder {
      constructor() {}
  
      withCsvFile(csvFile) {
        this.csvFile = csvFile;
        return this;
      }
      
      setAccount(account) {
        this.account = account;
        return this;
      }
      
      build() {
        return new StatementBuilder(this).buildStatement();
      }
    }
    return Builder;
  }
  
  get numTransactions() {
    return this.transactions.length; 
  }
  
}

class StatementBuilder {
  constructor(build) {
    this.csvFile = build.csvFile;
    this.account = build.account;
  }
  
  buildStatement() {
    let csvString = this.csvFile.getBlob().getDataAsString();
    
    let statement = new Statement();
    statement.account = this.account;
    let transactions = [];

    if(this.account.name == Constants.accountNames.UBS_DEBIT_CHF) {
      let rows = Utilities.parseCsv(csvString, "\;").splice(1);
      for(let row of rows) {
        let transaction = this._buildUbsDebitTransaction(row);
        transaction !== null ? transactions.push(transaction) : null;
      }
    }

    if(this.account.name == Constants.accountNames.UBS_CREDIT_CHF) {
      let rows = Utilities.parseCsv(csvString, "\;").splice(1);
      for(let row of rows) {
        let transaction = this._buildUbsCreditTransaction(row);
        transaction !== null ? transactions.push(transaction) : null;
      }
    }

    if(this.account.name == Constants.accountNames.REVOLUT_DEBIT_CHF) {
      // Removes comma from numbers in quotation marks
      csvString.match(/("[^,]+),(.+")/g).forEach(t =>
        csvString = csvString.split(t).join(t.replace(/,/g,''))
      );
      let rows = Utilities.parseCsv(csvString).splice(1);
      for(let row of rows) {
        let transaction = this._buildRevolutDebitTransaction(row);
        transaction !== null ? transactions.push(transaction) : null;
      }
    }

    if(this.account.name == Constants.accountNames.NEON_DEBIT_CHF) {
      let rows = Utilities.parseCsv(csvString).splice(1);
      for(let row of rows) {
        let transaction = this._buildNeonDebitTransaction(row);
        transaction !== null ? transactions.push(transaction) : null;
      }
    }

    statement.transactions = transactions;
    return statement;
   
  }
  
  _buildUbsDebitTransaction(row) {
    let balance = this._formatNumber(row[20]);
    let debit = this._formatNumber(row[18]);
    let credit = this._formatNumber(row[19]);
    
    if(balance !== "" && (debit > 0 || credit > 0)) {
      return new Transaction.Builder()
        .setDate(this._formatDate(row[9]))
        .setSource(Constants.accountNames.UBS_DEBIT_CHF)
        .setDesc(row[13] + row[14])
        .setValue(debit > 0 ? -Math.abs(debit) : credit)
        .setCategory(this._getCategory(row[13] + row[14]))
        .build();
    }
    
    return null;
  }
  
  _buildUbsCreditTransaction(row) {
    let cardHolder = row[2];
    let cardNumber = row[1];
    let bookedDate = row[12];
    
    if(cardNumber !== "" && 
       bookedDate != "" && 
       cardHolder == "NICHOLAS HALL") {

      let debit = this._formatNumber(row[10])
      let credit = this._formatNumber(row[11])
      
      return new Transaction.Builder()
        .setDate(this._formatDate(row[3]))
        .setSource(Constants.accountNames.UBS_CREDIT_CHF)
        .setDesc(row[4])
        .setValue(debit > 0 ? -Math.abs(debit) : credit)
        .setCategory(this._getCategory(row[4]))
        .build();
    }
    
    return null;  
  }
  
  _buildRevolutDebitTransaction(row) {    
    return new Transaction.Builder()
      .setDate(new Date(row[3]))
      .setSource(Constants.accountNames.REVOLUT_DEBIT_CHF)
      .setDesc(row[4])
      .setValue(row[5])
      .setCategory(this._getCategory(row[4]))
      .build();
  }

  _buildNeonDebitTransaction(row) {
    return new Transaction.Builder()
      .setDate(new Date(row[0]))
      .setSource(Constants.accountNames.NEON_DEBIT_CHF)
      .setDesc(row[2])
      .setValue(row[1])
      .setCategory(this._getCategory(row[2]))
      .build()
  }
  
  _getCategory(desc) {
    desc = desc.toUpperCase();
  
    let CATEGORY_MAP = {
      "MIGRO": "Supermarket",
      "COOP": "Supermarket",
      "PKE": "Rent",
      "CREDIT": "Credit card",
      "SANITAS": "Healthcare",
      "SALARY": "Salary",
      "ELEKTRIZITAETSWERK": "Electricity",
      "REVOLUT": "Transfer",
      "TRANSFER": "Transfer",
      "SBB": "Train",
      "BUNDESBAHN": "Train",
      "EAT.CH": "Delivery",
      "NETFLIX": "Subscription",
      "YOUTUBE": "Subscription",
      "EXPRESSVPN": "Subscription",
      "LINGUISTICA": "Subscription",
      "EASYJET": "Flights",
      "AMERICAN AIR": "Flights",
      "SWISS INTL": "Flights",
      "AERLING": "Flights",
      "AEROFLOT": "Flights",
      "BRITISH AIRWAYS": "Flights",
      "B A INTERNET SALES": "Flights",
      "IKEA": "Furniture",
      "CAFE": "Coffee",
      "COFFEE": "Coffee",
      "STARBUCKS": "Coffee"
    }
    
    let keys = Object.keys(CATEGORY_MAP);
  
    for(let key of keys) {
      if(desc.match(key)) {
        return CATEGORY_MAP[key];
      }
    }
    return "Unknown"
    
  }
  
  _stringToDate(dateString) {
    let date = dateString.split(".");
    
    let year = date[2];
    let month = date[1];
    let day = date[0];
  
    return new Date(year + "-" + month + "-" + day);
  }

  _formatNumber(str) {
    if(str == "") {
      return ''; 
    }
  
    return parseFloat(str.replace('\'', ''));
  }

}
