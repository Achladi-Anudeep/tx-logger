import { getTransactions } from "./loggerinTs";

getTransactions("0xd966A6Ea0B9930F9dB4e4c83198323739C441C40").then((f) =>
  console.log(f, "final")
);
