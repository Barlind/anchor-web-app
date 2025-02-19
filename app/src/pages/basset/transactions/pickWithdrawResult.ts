import {
  demicrofy,
  formatLuna,
  formatUSTWithPostfixUnits,
  stripULuna,
} from '@anchor-protocol/notation';
import { uUST } from '@anchor-protocol/types';
import { TxHashLink } from 'base/components/TxHashLink';
import { TxInfoParseError } from 'base/errors/TxInfoParseError';
import { TransactionResult } from 'base/models/transaction';
import {
  Data,
  pickAttributeValue,
  pickEvent,
  pickRawLog,
} from 'base/queries/txInfos';
import { createElement } from 'react';
import { TxResult } from '@terra-money/wallet-provider';

interface Params {
  txResult: TxResult;
  txInfo: Data;
  txFee: uUST;
}

export function pickWithdrawResult({
  txInfo,
  txResult,
  txFee,
}: Params): TransactionResult {
  const rawLog = pickRawLog(txInfo, 0);

  if (!rawLog) {
    throw new TxInfoParseError(txResult, txInfo, 'Undefined the RawLog');
  }

  const transfer = pickEvent(rawLog, 'transfer');

  console.log('pickWithdrawResult.ts..pickWithdrawResult()', transfer);

  console.log(
    'pickWithdrawResult.ts..pickWithdrawResult()',
    JSON.stringify(transfer, null, 2),
  );

  if (!transfer) {
    throw new TxInfoParseError(
      txResult,
      txInfo,
      'Undefined the transfer event',
    );
  }

  /**
   {
     "type": "transfer",
     "attributes": [
       {
         "key": "recipient",
         "value": "terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v"
       },
       {
         "key": "sender",
         "value": "terra1kzx23xs8v9yggf6lqpwgerg455e8xzsv0s0glf"
       },
       {
         "key": "amount",
         "value": "20000000uluna"
       }
     ]
   }
   */

  const unbondedAmount = pickAttributeValue<string>(transfer, 2);

  const txHash = txResult.result.txhash;

  return {
    txInfo,
    txResult,
    //txFee,
    //txHash,
    details: [
      !!unbondedAmount && {
        name: 'Unbonded Amount',
        value: formatLuna(demicrofy(stripULuna(unbondedAmount))) + ' Luna',
      },
      {
        name: 'Tx Hash',
        value: createElement(TxHashLink, { txHash }),
      },
      {
        name: 'Tx Fee',
        value: formatUSTWithPostfixUnits(demicrofy(txFee)) + ' UST',
      },
    ],
  };
}
