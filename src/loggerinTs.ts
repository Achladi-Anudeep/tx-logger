import { ethers } from "ethers";
import axios from "axios";
import { Action, Transaction } from "./interfaces";
import { performance } from "perf_hooks";
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from "ethereum-multicall";
let sym: any;
const account = "0xd966A6Ea0B9930F9dB4e4c83198323739C441C40"; // Replace this with account required to get history
//approve,transfer/burn,swaps(4-types of swaps)
let methods = ["0x095ea7b3", "0xa9059cbb"];
let swapMethods = ["0x18cbafe5", "0xb6f9de95", "0x791ac947", "0x8803dbee"];
const provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
);
const multicall = new Multicall({
  ethersProvider: provider,
  tryAggregate: true,
});
const IERC = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

let p1: number;

const transectinsfailedAll = async (data: Transaction) => {
  return {
    typeName: "Failed",
    hash: data.hash.toString(),
    gasCost: data.gas.toString(),
    action: "Failed Contract Creation",
  };
};

const transectionTransfer1 = async (data: Transaction) => {
  const contract = new ethers.Contract(data.to, IERC, provider);
  let tokens = parseInt(data.input.slice(10 + 64, 10 + 64 + 64), 16);
  tokens = tokens / 10 ** (await contract.decimals());
  let tokensymbol = await contract.symbol();
  // console.log(data, "datatattatatatat");
  const contractCallContext: ContractCallContext<{
    extraContext: string;
    foo4: boolean;
  }>[] = [
    {
      reference: "testContract",
      contractAddress: data.to,
      abi: IERC,
      calls: [
        {
          reference: "decimals",
          methodName: "decimals",
          methodParameters: [],
        },
      ],
    },
    {
      reference: "testContract2",
      contractAddress: data.to,
      abi: IERC,
      calls: [
        {
          reference: "symbol",
          methodName: "symbol",
          methodParameters: [],
        },
      ],
    },
    {
      reference: "testContract3",
      contractAddress: data.to,
      abi: IERC,
      calls: [
        {
          reference: "name",
          methodName: "name",
          methodParameters: [],
        },
      ],
    },
  ];

  multicall.call(contractCallContext).then((x) => {
    sym = x.results.testContract2.callsReturnContext[0].returnValues.toString();
    console.log(x.results.testContract3.callsReturnContext[0], "final");
  });
  //console.log(data.hash,'\ntransfered',tokens,tokensymbol,'\tto=>',data.to, data.from,"\n");

  return {
    token: tokensymbol,
    amount: tokens,
    from: data.from,
    to: data.to,
  };
};

const transactionApproved = async (data: Transaction) => {
  //console.log(data.hash)
  const spend = ethers.BigNumber.from(
    "0x" + data.input.substring(74, 74 + 64)
  ).toBigInt();
  //console.log('approved Address ' +'0x'+(ethers.utils.hexStripZeros('0x'+data.input.substring(10,74))) +
  //' to Spend '+ethers.BigNumber.from('0x'+data.input.substring(74,74+64)).toBigInt())
  const contract = new ethers.Contract(data.to, IERC, provider);
  let tokensymbol = await contract.symbol();

  return {
    token: tokensymbol,
    amount: spend,
    owner: data.to,
    spender: data.from,
  };
};

const transactionSwap = async (data: Transaction) => {
  let text = data.input;
  let tokeninAddress =
    "0x" + text.slice(text.length - 64 - 64, text.length - 64).slice(24);
  let tokenoutAddress = text.slice(text.length - 64).slice(24);
  let tokensin = parseInt(text.slice(10, 10 + 64), 16);
  let tokensout = parseInt(text.slice(10 + 64, 10 + 64 + 64), 16);

  let tin, tout;

  const contract1 = new ethers.Contract(tokeninAddress, IERC, provider);
  tokensin = tokensin / 10 ** (await contract1.decimals());
  tin = await contract1.symbol();

  const contract2 = new ethers.Contract(tokenoutAddress, IERC, provider);
  tokensout = tokensout / 10 ** (await contract2.decimals());
  tout = await contract2.symbol();
  //console.log(data.hash,'\nswapped\t',tokensin,tin,'\t for\t',tokensout,tout);

  return {
    token1: tin,
    token2: tout,
    amount1: tokensin,
    amount2: tokensout,
    to: data.from,
    router: data.to,
  };
};

const allTransfer0x = async (data: Transaction) => {
  return {
    typeName: "Transfer",
    hash: data.hash.toString(),
    gasCost: data.gas.toString(),
    action: {
      token: "BNB",
      amount: ethers.utils
        .formatEther(ethers.BigNumber.from(data.value))
        .toString(),
      from: data.from.toString(),
      to: data.to.toString(),
    },
  };
};

const transectionAction = async (data: Transaction) => {
  var type = "unknown";
  var action = undefined;
  if (data.isError == "1") {
    type = "Failed";
    action = await transectinsfailedAll(data);
  } else {
    if (data.input == "0x") {
      type = "TransferBNB";
      action = await allTransfer0x(data);
    } else if (data.input.substring(0, 10) == methods[0]) {
      type = "Approved";
      action = await transactionApproved(data);
    } else if (data.input.substring(0, 10) == methods[1]) {
      type = "Transfer";
      action = await transectionTransfer1(data);
    } else if (data.contractAddress != "") {
      type = "Creation";
      action = "Creation";
    } else if (
      data.input.substring(0, 10) == swapMethods[0] ||
      data.input.substring(0, 10) == swapMethods[1] ||
      data.input.substring(0, 10) == swapMethods[2] ||
      data.input.substring(0, 10) == swapMethods[3]
    ) {
      type = "swap";
      action = await transactionSwap(data);
    }
  }
  return {
    typeName: type,
    hash: data.hash,
    gasCost: data.gas,
    action: action,
  };
};

export const getTransactions = async (account: string) => {
  let allTransactions: any = await axios.get(
    "https://api.bscscan.com/api?module=account&action=txlist&address=" +
      account +
      "&startblock=0&endblock=999999999&apikey=R87N9A3QY37KJW4GCNHTGWAE3XT133YPYN}"
  );

  let data = await allTransactions.data.result.map((i: Transaction) => {
    return i;
  });

  p1 = performance.now();
  console.log(p1, "p1");

  const transferaction: Promise<Action>[] = data
    .filter(function (result: Transaction) {
      if (
        result.input.substring(0, 10) == "0xf305d719" ||
        result.input.substring(0, 10) == "0xded9382a" ||
        result.input.substring(0, 10) == "0x4a25d94a"
      )
        return false;
      else return true;
    })
    .map((result: Transaction) => {
      return transectionAction(result);
    });
  console.log("Before resolve " + (performance.now() - p1).toString());
  return transferaction;
};

// getTransactions(account).then((dataList: Promise<Action>[]) => {
//   dataList.forEach((data: Promise<Action>) => {
//     Promise.resolve(data).then((result: Action) => {
//       console.log(result);
//     });
//     console.log("After Resolve " + (performance.now() - p1).toString());
//   });
// });
