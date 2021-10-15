class Constants {

  static get SPREADSHEET_ID() { return "1L6wesda-6g387YV6A-45GuA-jiEyiRmpj3vIeyZs1EM" };
  static get TEST_SPREADSHEET_ID() { return "1rI8buiPoDVTvQExU-AfT2O3fj7FhLYJjaiMLvFkGoLM" };

  static getFolderId(accountName) {
    let folderIds = {
      NEON_DEBIT_CHF: "1JPjclPJaOgOHTogt-jmTSGurixQBHWUN",
      REVOLUT_DEBIT_CHF: "1lkpOKLBN-HDN35o_omyIyAiv1V8KLiov",
      UBS_DEBIT_CHF: "1Gowp8Gn8UNVzak3NuujQjc_DY2xq2B9m",
      UBS_CREDIT_CHF: "1b0sf4QY2KcarLK8vXz30a8Utk5L4QwTt"
    };

    if(accountName in folderIds) {
      return folderIds[accountName];
    }

    return Error("Folder ID not found.")

  }

  static get accountNames() {
    return {
      // Master sheet
      ALL_CHF: "ALL_CHF",

      // Bank accounts
      NEON_DEBIT_CHF: "NEON_DEBIT_CHF",
      REVOLUT_DEBIT_CHF: "REVOLUT_DEBIT_CHF",
      UBS_DEBIT_CHF: "UBS_DEBIT_CHF",
      UBS_CREDIT_CHF: "UBS_CREDIT_CHF",
      IB_CHF: "IB_CHF",
      SANTANDER_DEBIT_GBP: "SANTANDER_DEBIT_GBP",

      // Pensions
      PENSION_VIAC_3A_CHF: "PENSION_VIAC_3A_CHF",
      PENSION_AXA_2_CHF: "PENSION_AXA_2_CHF",
      PENSION_AVIVA_GBP: "PENSION_AVIVA_GBP",
      PENSION_ROYAL_LONDON_GBP: "PENSION_ROYAL_LONDON_GBP",

      // Deposits
      CS_DEPOSIT_CHF: "CS_DEPOSIT_CHF",
      BGS_DEPOSIT_CHF: "BGS_DEPOSIT_CHF",

      // Assets
      STOCK: "STOCK",
      CRYPTO: "CRYPTO"
    }
  }
}
