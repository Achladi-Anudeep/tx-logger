import { getTransactions } from "./loggerinTs";
import { Action, Transaction } from "./interfaces";
getTransactions("0xd966A6Ea0B9930F9dB4e4c83198323739C441C40").then(
  (f: Promise<Action>[]) => {
    f.forEach((data: Promise<Action>) => {
      Promise.resolve(data).then((result: Action) => {
        console.log(result);
      });
    });
  }
);
