export interface Response{
    status : String,
    message : String,
    result : Array<Transaction>

}

export interface Transaction {
    blockNumber:String,
    timeStamp:String,
    hash:String,
    nonce:String,
    blockHash:String,
    transactionIndex:String,
    from:String,
    to:string,
    value:String,
    gas:String,
    gasPrice:String,
    isError:String,
    txreceipt_status:String,
    input:String,
    contractAddress:String,
    cumulativeGasUsed:String,
    gasUsed:String,
    confirmations:String
}

export interface Transfer {
    token : string,
    amount : string,
    from : string,
    to: string
}

export interface Approve {
    token : string,
    amount : string,
    owner: string,
    spender : string
}


export interface Swap {
    token1 : string,
    token2 : string,
    amount1 : Number,
    amount2 : Number,
    to : string,
    router : string
}

export interface Action {
    typeName : ('Transfer'|'Swap'|'Approve'|'Creation'|'Failed')
    hash: string,
    gasCost : string,
    action : Transfer | Approve |  Swap | Transaction | string
}