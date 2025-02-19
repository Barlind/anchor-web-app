import {
  ANC_INPUT_MAXIMUM_DECIMAL_POINTS,
  ANC_INPUT_MAXIMUM_INTEGER_POINTS,
  demicrofy,
  formatANC,
  formatANCInput,
  formatUST,
  microfy,
} from '@anchor-protocol/notation';
import { ANC, uANC } from '@anchor-protocol/types';
import {
  useConnectedWallet,
  ConnectedWallet,
} from '@terra-money/wallet-provider';
import { InputAdornment, Modal } from '@material-ui/core';
import { ThumbDownOutlined, ThumbUpOutlined } from '@material-ui/icons';
import { useOperation } from '@terra-dev/broadcastable-operation';
import { ActionButton } from '@terra-dev/neumorphism-ui/components/ActionButton';
import { Dialog } from '@terra-dev/neumorphism-ui/components/Dialog';
import { IconSpan } from '@terra-dev/neumorphism-ui/components/IconSpan';
import { NumberInput } from '@terra-dev/neumorphism-ui/components/NumberInput';
import { flat } from '@terra-dev/styled-neumorphism';
import { DialogProps, OpenDialog, useDialog } from '@terra-dev/use-dialog';
import { useBank } from 'base/contexts/bank';
import { useConstants } from 'base/contexts/contants';
import big, { Big } from 'big.js';
import { MessageBox } from 'components/MessageBox';
import { TransactionRenderer } from 'components/TransactionRenderer';
import { TxFeeList, TxFeeListItem } from 'components/TxFeeList';
import { validateTxFee } from 'logics/validateTxFee';
import { useCanIVote } from 'pages/gov/queries/canIVote';
import { useRewardsAncGovernance } from 'pages/gov/queries/rewardsAncGovernance';
import { voteOptions } from 'pages/gov/transactions/voteOptions';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';

interface FormParams {
  className?: string;
  pollId: number;
}

type FormReturn = void;

export function usePollVoteDialog(): [
  OpenDialog<FormParams, FormReturn>,
  ReactNode,
] {
  return useDialog(Component);
}

function ComponentBase({
  className,
  closeDialog,
  pollId,
}: DialogProps<FormParams, FormReturn>) {
  const [vote, voteResult] = useOperation(voteOptions, {});

  const connectedWallet = useConnectedWallet();

  const { fixedGas } = useConstants();

  const bank = useBank();

  const {
    data: { userGovStakingInfo },
  } = useRewardsAncGovernance();

  const canIVote = useCanIVote(pollId);

  const [voteFor, setVoteFor] = useState<null | 'yes' | 'no'>(null);
  const [amount, setAmount] = useState<ANC>('' as ANC);

  const maxVote = useMemo(() => {
    if (!userGovStakingInfo) {
      return undefined;
    }

    return big(userGovStakingInfo.balance) as uANC<Big>;
  }, [userGovStakingInfo]);

  const invalidTxFee = useMemo(
    () => !!connectedWallet && validateTxFee(bank, fixedGas),
    [bank, fixedGas, connectedWallet],
  );

  const invalidAmount = useMemo(() => {
    if (amount.length === 0 || !connectedWallet) return undefined;

    const uanc = microfy(amount);

    return maxVote && uanc.gt(maxVote) ? 'Not enough assets' : undefined;
  }, [amount, maxVote, connectedWallet]);

  const txFee = fixedGas;

  const submit = useCallback(
    async (
      walletReady: ConnectedWallet,
      voteFor: 'yes' | 'no',
      amount: ANC,
    ) => {
      await vote({
        address: walletReady.walletAddress,
        poll_id: pollId,
        vote: voteFor,
        amount,
      });
    },
    [pollId, vote],
  );

  if (
    voteResult?.status === 'in-progress' ||
    voteResult?.status === 'done' ||
    voteResult?.status === 'fault'
  ) {
    return (
      <Modal open disableBackdropClick disableEnforceFocus>
        <Dialog className={className}>
          <TransactionRenderer result={voteResult} onExit={closeDialog} />
        </Dialog>
      </Modal>
    );
  }

  return (
    <Modal open onClose={() => closeDialog()}>
      <Dialog className={className} onClose={() => closeDialog()}>
        <h1>Vote</h1>

        <MessageBox
          level="info"
          hide={{ id: 'vote', period: 1000 * 60 * 60 * 24 * 7 }}
        >
          Vote cannot be changed after submission. Staked ANC used to vote in
          polls are locked and cannot be withdrawn until the poll finishes.
        </MessageBox>

        {!!invalidTxFee && <MessageBox>{invalidTxFee}</MessageBox>}

        <ul className="vote">
          <li
            data-vote="yes"
            data-selected={voteFor === 'yes'}
            onClick={() => setVoteFor('yes')}
          >
            <i>
              <ThumbUpOutlined />
            </i>
            <span>YES</span>
          </li>
          <li
            data-vote="no"
            data-selected={voteFor === 'no'}
            onClick={() => setVoteFor('no')}
          >
            <i>
              <ThumbDownOutlined />
            </i>
            <span>NO</span>
          </li>
        </ul>

        <NumberInput
          className="amount"
          value={amount}
          maxIntegerPoinsts={ANC_INPUT_MAXIMUM_INTEGER_POINTS}
          maxDecimalPoints={ANC_INPUT_MAXIMUM_DECIMAL_POINTS}
          label="AMOUNT"
          onChange={({ target }: ChangeEvent<HTMLInputElement>) =>
            setAmount(target.value as ANC)
          }
          InputProps={{
            endAdornment: <InputAdornment position="end">ANC</InputAdornment>,
          }}
        />

        <div className="wallet" aria-invalid={!!invalidAmount}>
          <span>{invalidAmount}</span>
          <span>
            Balance:{' '}
            <span
              style={{
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
              onClick={() =>
                maxVote && setAmount(formatANCInput(demicrofy(maxVote)))
              }
            >
              {maxVote ? formatANC(demicrofy(maxVote)) : 0} ANC
            </span>
          </span>
        </div>

        {txFee && (
          <TxFeeList className="receipt">
            <TxFeeListItem label={<IconSpan>Tx Fee</IconSpan>}>
              {formatUST(demicrofy(txFee))} UST
            </TxFeeListItem>
          </TxFeeList>
        )}

        <ActionButton
          className="submit"
          disabled={
            !connectedWallet ||
            !canIVote ||
            amount.length === 0 ||
            !voteFor ||
            big(amount).lte(0) ||
            !!invalidTxFee ||
            !!invalidAmount
          }
          onClick={() =>
            connectedWallet &&
            !!voteFor &&
            submit(connectedWallet, voteFor, amount)
          }
        >
          Submit
        </ActionButton>
      </Dialog>
    </Modal>
  );
}

const Component = styled(ComponentBase)`
  width: 720px;

  h1 {
    font-size: 27px;
    text-align: center;
    font-weight: 300;

    margin-bottom: 50px;
  }

  .vote {
    margin-top: 50px;

    list-style: none;
    padding: 0;

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 120px;
    grid-gap: 40px;

    li {
      cursor: pointer;
      display: grid;
      place-content: center;
      color: #cccccc;
      border-radius: 5px;

      font-size: 28px;
      font-weight: 300;
      text-align: center;

      svg {
        font-size: 28px;
      }

      ${({ theme }) =>
        flat({
          color: theme.backgroundColor,
          intensity: theme.intensity,
          distance: 6,
        })};

      &[data-selected='true'] {
        &[data-vote='yes'] {
          color: #15cc93;
          border: 1px solid #15cc93;
          background-color: rgba(21, 204, 147, 0.05);
        }

        &[data-vote='no'] {
          color: #e95979;
          border: 1px solid #e95979;
          background-color: rgba(233, 89, 121, 0.06);
        }
      }
    }

    margin-bottom: 60px;
  }

  .amount {
    width: 100%;
    margin-bottom: 5px;

    .MuiTypography-colorTextSecondary {
      color: currentColor;
    }
  }

  .wallet {
    display: flex;
    justify-content: space-between;

    font-size: 12px;
    color: ${({ theme }) => theme.dimTextColor};

    &[aria-invalid='true'] {
      color: ${({ theme }) => theme.colors.negative};
    }

    margin-bottom: 45px;
  }

  .receipt {
    margin-bottom: 30px;
  }

  .submit {
    width: 100%;
    height: 60px;
    border-radius: 30px;
  }
`;
