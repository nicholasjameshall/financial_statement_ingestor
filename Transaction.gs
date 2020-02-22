/*
  This class represents a Transaction.
*/
class Transaction {
  constructor(build) {
    this.date = build.date;
    this.month = build.month;
    this.desc = build.desc;
    this.debit = build.debit;
    this.credit = build.credit;
    this.balance = build.balance;
    this.category = build.category;
  }
  
  toArray() {
    return [
      this.date,
      this.month,
      this.desc,
      this.category,
      "", // Blank for theme
      this.debit,
      this.credit,
      this.balance
    ];
  }
  
  getDate() {
    return this.date; 
  }

  static get Builder() {
    class Builder {
    
      onDate(date) {
        this.date = date;
        this.month = date.getFullYear().toString() + "-" + (date.getMonth() +1).toString();
        return this;
      }
  
      withDesc(desc) {
        this.desc = desc;
        return this;
      }
  
      withDebit(debit) {
        this.debit = debit;
        return this;
      }
  
      withCredit(credit) {
        this.credit = credit;
        return this;
      }
  
      withBalance(balance) {
        this.balance = balance;
        return this;
      }
      
      inCategory(category) {
        this.category = category;
        return this;
      }
  
      build() {
        return new Transaction(this);
      }
    }
    return Builder;
  }
}
