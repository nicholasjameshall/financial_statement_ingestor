/*
  This class represents a Transaction.
*/
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
  
  this.getDate = function() {
    return this.date; 
  }

  var Builder = function() {
    this.date = null;
    this.month = null;
    this.desc = null;
    this.debit = null;
    this.credit = null;
    this.balance = null;

    this.onDate = function(date) {
      this.date = date;
      this.month = date.getFullYear().toString() + "-" + (date.getMonth() +1).toString();
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
