/*
  This class represents an Account.
*/
class Account {
  constructor(name) {
    this.folderId;
    this.sheetName;
    this.name;

    let names = [
      "UBS_DEBIT_CHF",
      "UBS_CREDIT_CHF",
      "REVOLUT_DEBIT_CHF"
    ]

    if(names.includes(name)) {
      this.name = name;
    } else {
      throw new Error("Account Error: Invalid Account Type")
    }
  }
}
