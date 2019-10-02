/*
  This class represents a Statement.
*/
var Statement = function() {
  this.transactions = [];
  
  this.getNumTransactions = function() {
    return this.transactions.length; 
  }
  
  this.addTransaction = function(row) {
    if(typeof row != 'undefined' && row !== null) {
      this.transactions.push(row);
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
    this.transactions = this.transactions.sort(UtilityClass.sortByDate);
    return this;
  }
}
