/*
  This class represents an individual transaction.
  This is either a transaction within a new statement, or a transaction
    which already appears in the spreadsheet.
*/
class Transaction {
  constructor(build) {
    this.date = build.date;
    this.source = build.source;
    this.desc = build.desc;
    this.category = build.category;
    this.theme = build.theme;
    this.value = build.value;
  }
  
  toArray() {
    return [
      this.date,
      this.source,
      this.desc,
      this.category,
      this.theme,
      this.value,
    ];
  }

  isDuplicate(transaction) {
    if(this.dateString == transaction.dateString &&
      this.value == transaction.value) {
        return True;
      }
    return False;
  }
  
  get dateString() {
    return this.date.getFullYear() + "-" + (this.date.getMonth() + 1).toString() + "-" + this.date.getDate(); 
  }

  static get Builder() {
    class Builder {
    
      setDate(date) {
        this.date = date;
        return this;
      }

      setSource(source) {
        this.source = source;
        return this;
      }
  
      setDesc(desc) {
        this.desc = desc;
        return this;
      }

      setCategory(category) {
        this.category = category;
        return this;
      }
  
      setValue(value) {
        this.value = value;
        return this;
      }
  
      build() {
        this.theme = this._getTheme(this.category)
        return new Transaction(this);
      }

      _getTheme(category) {
        let map = {
          'Clothing': 'Appearance',
          'Salary': 'Salary',
          'Healthcare': 'Regular payment (insurace, tax, loan etc.)',
          'Haircut': 'Appearance',
          'Coffee': 'Food & Drink',
          'Home Insurance': 'Regular payment (insurace, tax, loan etc.)',
          'TV Licence': 'Regular payment (insurace, tax, loan etc.)',
          'Eating out': 'Social',
          'Supermarket': 'Food & Drink',
          'Tram': 'Transport',
          'Hobby': 'Hobby',
          'Train': 'Transport',
          'Health': 'Health',
          'Drinks': 'Food & Drink',
          'Withdrawal': 'Withdrawal',
          'Rent': 'Accommodation',
          'Gift': 'Gift',
          'Books': 'Study',
          'Credit card': 'Credit card',
          'Cinema': 'Social',
          'Hotel': 'Travel',
          'Taxi': 'Transport',
          'Souvenir': 'Travel',
          'Charge': 'Misc',
          'Technology': 'Hobby',
          'Furniture': 'Accommodation',
          'Electricity': 'Regular payment (insurace, tax, loan etc.)',
          'Internet': 'Regular payment (insurace, tax, loan etc.)',
          'Unknown': 'Misc',
          'Study': 'Study',
          'Reimbursement': 'Misc',
          'Travel Admin': 'Travel',
          'Post': 'Post',
          'Parking': 'Transport',
          'Transfer': 'Transfer',
          'Transfer (ext)': 'Transfer',
          'Entry tickets': 'Travel',
          'Delivery': 'Food & Drink',
          'Subscription': 'Regular payment (insurace, tax, loan etc.)',
          'Flights': 'Travel',
          'Charity': 'Gift',
          'Bureaucracy': 'Misc',
          'Travel Expense': 'Travel',
          'Petrol': 'Transport',
          'Tax': 'Regular payment (insurace, tax, loan etc.)',
          'Student Loan': 'Regular payment (insurace, tax, loan etc.)',
          'Laundry': 'Appearance',
          'Fine': 'Misc',
          'Capital gains': 'Capital gains',
          'Car rental': 'Travel',
          'GOOG': 'Stock vest',
          'GOOGL': 'Stock vest',
          'Cleaner': 'Accommodation',
          'Pre-tax Pension contribution': 'Pension contribution',
          'Cleaner': 'Accommodation',
          'Gym': 'Health',
        }

        if(category in map) {
          return map[category];
        }
        return "Unknown"
      }

    }
    return Builder;
  }
}
