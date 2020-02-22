/*
  This class represents an Account.
*/
class Account {
  constructor(accountName) {
    this.UBS_DEBIT_SHEET_NAME = "UBS_DEBIT_CHF";
    this.UBS_CREDIT_SHEET_NAME = "UBS_CREDIT_CHF";
    this.REVOLUT_DEBIT_SHEET_NAME = "REVOLUT_DEBIT_CHF";
  
    this.UBS_DEBIT_FOLDER_ID = "1Gowp8Gn8UNVzak3NuujQjc_DY2xq2B9m";
    this.UBS_CREDIT_FOLDER_ID = "1b0sf4QY2KcarLK8vXz30a8Utk5L4QwTt";
    this.REVOLUT_DEBIT_FOLDER_ID = "1lkpOKLBN-HDN35o_omyIyAiv1V8KLiov";
    
    this.folderId;
    this.sheetName;
    this.accountName = accountName;
    
    switch(accountName) {
      case "UBS_DEBIT":
        this.sheetName = this.UBS_DEBIT_SHEET_NAME;
        this.folderId = this.UBS_DEBIT_FOLDER_ID;
        break;
      case "UBS_CREDIT":
        this.sheetName = this.UBS_CREDIT_SHEET_NAME;
        this.folderId = this.UBS_CREDIT_FOLDER_ID;
        break;
      case "REVOLUT_DEBIT":
        this.sheetName = this.REVOLUT_DEBIT_SHEET_NAME;
        this.folderId = this.REVOLUT_DEBIT_FOLDER_ID;
        break;
    }
    
  }
  
  getFolderId() {
    return this.folderId;
  }
  
  getSheetName() {
    return this.sheetName; 
  }
  
  getName() {
    return this.accountName;
  }
}
