/*
  Returns HTML of app
*/
function doGet(e) {
  return HtmlService.createTemplateFromFile("app").evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

/*
  Returns the latest n CSV files for a given account.
*/
function getLatestCsvFiles(accountName, numFiles) {
  let folder = DriveApp.getFolderById(Constants.getFolderId(accountName));
  let fileIterator = folder.getFiles();
  let files = [];
  
  /* Retrieves all CSV files */
  while (fileIterator.hasNext()) {
    let file = fileIterator.next();
    file.getMimeType() == "text/csv" ? files.push(file) : null;
  }

  if(files.length == 0) {
    throw Error("getLatestCsvFilesError: no files found.");
  }
  
  /*
    Sorts and gets the top n CSV files
  */
  let fileMetadataList = files
    .sort((a, b) => {
      (a.getDateCreated() - b.getDateCreated())})
    .map((file, i) => {
      return new FileMetadata(
        file.getId(),
        file.getDateCreated(),
        file.getName()
      )
    })
    .slice(0,
      files.length < numFiles ? files.length: numFiles);

  return new GetLatestCsvFilesResponse(fileMetadataList).serialize();
}

/*
  Endpoint frontend to call
*/
function uploadCsv(accountName, csvId) {
  let account = new Account(accountName);
  let csvFile = DriveApp.getFileById(csvId);
  let spreadsheet = SpreadsheetApp.openById(Constants.TEST_SPREADSHEET_ID);
  let targetSheet = spreadsheet.getSheetByName(account.name);
    
  let statement = new Statement.Builder()
    .withCsvFile(csvFile)
    .setAccount(account)
    .build();
  
  statement.removeDuplicateTransactions(targetSheet);
  
  if(statement.transactions.length == 0) {
    throw Error("No eligible transactions");
  } else {
    targetSheet.insertRows(
      2, // Starting row
      statement.transactions.length // Ending row
    );
      
    targetSheet
      .getRange(
        2, // Starting row
        1, // Starting column
        statement.transactions.length, // Ending row
        statement.transactions[0].toArray().length) // Ending column
      .setValues(statement.transactions.map(transaction => transaction.toArray()));

    targetSheet.sort(1, false);

    return new UploadCsvResponse(statement.transactions.length).serialize();
  } 
}

function updateMasterSheet() {
  let ss = SpreadsheetApp.openById(Constants.TEST_SPREADSHEET_ID);
  let sourceSheets = [

    // Debit accounts
    ss.getSheetByName(Constants.accountNames.REVOLUT_DEBIT_CHF), 
    ss.getSheetByName(Constants.accountNames.NEON_DEBIT_CHF),
    ss.getSheetByName(Constants.accountNames.UBS_DEBIT_CHF), 
    ss.getSheetByName(Constants.accountNames.SANTANDER_DEBIT_GB),

    // Deposit accounts
    ss.getSheetByName(Constants.accountNames.BGS_DEPOSIT_CHF),
    ss.getSheetByName(Constants.accountNames.CS_DEPOSIT_CHF),

    // Broker accounts
    ss.getSheetByName(Constants.accountNames.IB_CHF),

    // Credit accounts
    ss.getSheetByName(Constants.accountNames.UBS_CREDIT_CHF),

    // Pensions
    ss.getSheetByName(Constants.accountNames.PENSION_VIAC_3A_CHF),
    ss.getSheetByName(Constants.accountNames.PENSION_AXA_2_CHF),
    ss.getSheetByName(Constants.accountNames.PENSION_AVIVA_GBP),
    ss.getSheetByName(Constants.accountNames.PENSION_ROYAL_LONDON_GBP),

    // Other assets
    ss.getSheetByName(Constants.accountNames.STOCK),
    ss.getSheetByName(Constants.accountNames.CRYPTO)
  ];

  let rows = getSortedTransactions(sourceSheets);
  let targetSheet = ss.getSheetByName(Constants.accountNames.ALL_CHF);

  targetSheet.deleteRows(2, targetSheet.getMaxRows() - 1);
  targetSheet.insertRowsAfter(1, rows.length);
  
  let targetRange = targetSheet.getRange(2, 1, 
    rows.length, // ending row
    rows[0].NUM_COLUMNS // ending column
  );

  targetRange.setValues(rows.map(row => row.toArray()));
  
}

function getSortedTransactions(sheets) {
  let rows = [];
  
  for(let sheet of sheets) {
    let sheetName = sheet.getName();
    rows = rows.concat(sheet.getRange("A:G")
      .getValues()
      .slice(1) // ignore title row
      .map(row =>
        new Transaction.Builder()
          .setDate(row[0])
          .setSource(sheetName)
          .setDesc(row[2])
          .setCategory(row[3])
          .setValue(row[5])
          .build()
        )
    );
  }
  
  rows.sort((a,b) => new Date(b.date) - new Date(a.date));
  return rows;
}
