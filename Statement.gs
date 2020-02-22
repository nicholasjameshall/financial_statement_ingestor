/*
  This class represents a Statement.
*/
class Statement {
  constructor() {
    this.transactions = [];
  }
  
  static get Builder() {
    class Builder {
      constructor() {}
  
      withCsvFile(csvFile) {
        this.csvFile = csvFile;
        return this;
      }
      
      ofAccount(account) {
        this.account = account;
        return this;
      }
      
      fromDate(fromDate) {
        this.fromDate = fromDate;
        return this;
      }
      
      build() {
        return new StatementBuilder(this).buildStatement();
      }
    }
    return Builder;
  }
  
  getNumTransactions() {
    return this.transactions.length; 
  }
  
  addTransaction(row) {
    if(typeof row != 'undefined' && row !== null) {
      this.transactions.push(row);
    }
  }
  
  toArray() {
    let rowArray = [];
    
    for (let i = 0; i < this.transactions.length; i++) {
      rowArray.push(this.transactions[i].toArray());
    }
    
    return rowArray;
  }
  
}

class StatementBuilder {
  constructor(build) {
    this.csvFile = build.csvFile;
    this.account = build.account;
    this.fromDate = build.fromDate;
  }
  
  buildStatement() {
    let csvString = this.csvFile.getBlob().getDataAsString();
    let csletray = Utilities.parseCsv(csvString, "\;").splice(1);
    
    let statement = new Statement();
    let transData;
            
    // Starts from the first row to avoid column headers.
    for(let i = 0; i < csletray.length; i++) {      
      switch(this.account.getName()) {
        case "UBS_DEBIT":
          transData = this._getUbsDebitTransactionData(csletray[i]);
          break;
        case "UBS_CREDIT":
          transData = this._getUbsCreditTransactionData(csletray[i]);
          break;
        case "REVOLUT_DEBIT":
          transData = this._getRevolutDebitTransactionData(csletray[i]);
          break;
      };
      
      if(transData !== null 
         && transData.date > this.fromDate) {        
        let transaction = new Transaction.Builder()
          .onDate(transData.date)
          .withDesc(transData.desc)
          .withDebit(transData.debit)
          .withCredit(transData.credit)
          .withBalance(transData.balance)
          .inCategory(transData.category)
          .build();
        
        statement.addTransaction(transaction);
      }
    }
    
    statement.transactions.sort(UtilityClass.sortByDate)
    
    return statement;
   
  }
  
  _getUbsDebitTransactionData(row) {
    let transData = {};
    
    transData.balance = this._formatNumber(row[20]);
    transData.debit = this._formatNumber(row[18]);
    transData.credit = this._formatNumber(row[19]);
    
    if(transData.balance !== "" && 
       (transData.debit > 0 || transData.credit > 0)) {
      transData.date = this._formatDate(row[9]);
      transData.desc = row[13] + row[14];
      transData.category = this._getCategory(transData.desc);

      return transData;
    }
    
    return null;
  }
  
  _getUbsCreditTransactionData(row) {
    let transData = {};
    
    let cardHolder = row[2];
    let cardNumber = row[1];
    let bookedDate = row[12];
    
    if(cardNumber !== "" && 
       bookedDate != "" && 
       cardHolder == "NICHOLAS HALL") {
      transData.date = this._formatDate(row[3]);
      transData.desc = row[4];
      transData.debit = this._formatNumber(row[10]);
      transData.credit = this._formatNumber(row[11]);
      transData.balance = transData.credit > 0 ? -Math.abs(transData.credit) : transData.debit;
      transData.category = this._getCategory(transData.desc);
      
      return transData;
    }
    
    return null;  
  }
  
  _getRevolutDebitTransactionData(row) {
    let transData = {};
    transData.debit = row[2];
    transData.credit = row[3];
    transData.date = this._formatDate(row[0]);
    transData.desc = row[1];
    transData.balance = null; // Empty row
    transData.category = this._getCategory(transData.desc);
      
    return transData;
  }
  
  _getCategory(desc) {
    desc = desc.toUpperCase();
  
    let CATEGORY_MAP = {
      "MIGRO": "Supermarket",
      "PKE": "Electricity",
      "CREDIT": "Credit Card",
      
      "REVOLUT": "Transfer",
      "TRANSFER": "Transfer",
      
      "SBB": "Train",
      
      "NETFLIX": "Subscription",
      "YOUTUBE": "Subscription",
      "EXPRESSVPN": "Subscription",
      
      
      "EASYJET": "Flights",
      "AMERICAN AIR": "Flights",
      "SWISS INTL": "Flights",
      "AERLING": "Flights",
      "AEROFLOT": "Flights",
      
      "IKEA": "Furniture",
      
      "CAFE": "Coffee",
      "COFFEE": "Coffee",
      "STARBUCKS": "Coffee"
    }
    
    let keys = Object.keys(CATEGORY_MAP);
  
    for(let i = 0; i < keys.length; i++) {
      if(desc.match(keys[i])) {
        return CATEGORY_MAP[keys[i]];
      }
    }
    return "Unknown"
    
  }
  
  _formatDate(dateString) {
    if(this.account.getName() == "REVOLUT_DEBIT") {
      let MONTHS_OF_YEAR = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];   
      let parts = dateString.split(" ");
      let year = parts[2];
      let month = MONTHS_OF_YEAR.indexOf(parts[1]);
      let day = parts[0];
      
      return new Date(year, month, day, 0, 0, 0, 0);

    } else {
      let year = dateString.substring(6);
      let month = dateString.substring(3, 5);
      let day = dateString.substring(0, 2);
    
      return new Date(year + "-" + month + "-" + day);
    }
  }

  _formatNumber(str) {
    if(str == "") {
      return ''; 
    }
  
    return parseFloat(str.replace('\'', ''));
  }

}
