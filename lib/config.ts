export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Motoria",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+2348000000000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@example.com",
  bank: {
    name: process.env.NEXT_PUBLIC_BANK_NAME || "Your Bank Name",
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "0123456789",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "Your Business Name Ltd",
  },
};

/** Common Nigerian bank USSD codes, shown as a hint on the payment page. */
export const ussdCodes = [
  { bank: "GTBank", code: "*737#" },
  { bank: "Access Bank", code: "*901#" },
  { bank: "Zenith Bank", code: "*966#" },
  { bank: "First Bank", code: "*894#" },
  { bank: "UBA", code: "*919#" },
];
