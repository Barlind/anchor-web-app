import { Terra, Walletconnect } from '@anchor-protocol/icons';
import { ClickAwayListener } from '@material-ui/core';
import { BorderButton } from '@terra-dev/neumorphism-ui/components/BorderButton';
import { FlatButton } from '@terra-dev/neumorphism-ui/components/FlatButton';
import { IconSpan } from '@terra-dev/neumorphism-ui/components/IconSpan';
import {
  ConnectType,
  useWallet,
  WalletStatus,
} from '@terra-money/wallet-provider';
import { useBank } from 'base/contexts/bank';
import { useAirdrop } from 'pages/airdrop/queries/useAirdrop';
import { useSendDialog } from 'pages/send/useSendDialog';
import { useCallback, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { AirdropContent } from './AirdropContent';
import { ConnectedButton } from './ConnectedButton';
import { DropdownBox, DropdownContainer } from './DropdownContainer';
import { NotConnectedButton } from './NotConnectedButton';
import { WalletDetailContent } from './WalletDetailContent';

export interface WalletSelectorProps {
  className?: string;
}

let _airdropClosed: boolean = false;

function WalletSelectorBase({ className }: WalletSelectorProps) {
  // ---------------------------------------------
  // dependencies
  // ---------------------------------------------
  const {
    install,
    status,
    connect,
    disconnect,
    wallets,
    network,
    availableConnectTypes,
    availableInstallTypes,
  } = useWallet();

  const bank = useBank();

  const [airdrop] = useAirdrop();

  const matchAirdrop = useRouteMatch('/airdrop');

  const [openSendDialog, sendDialogElement] = useSendDialog();

  // ---------------------------------------------
  // states
  // ---------------------------------------------
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  const [airdropClosed, setAirdropClosed] = useState(() => _airdropClosed);

  const closeAirdrop = useCallback(() => {
    setAirdropClosed(true);
    _airdropClosed = true;
  }, []);

  // ---------------------------------------------
  // callbacks
  // ---------------------------------------------
  const connectWallet = useCallback(() => {
    if (availableConnectTypes.length > 1) {
      setOpenDropdown(true);
    } else if (availableConnectTypes.length === 1) {
      connect(availableConnectTypes[0]);
    }
  }, [availableConnectTypes, connect]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setOpenDropdown(false);
    //window.location.reload();
  }, [disconnect]);

  const toggleOpen = useCallback(() => {
    setOpenDropdown((prev) => !prev);
  }, []);

  const onClickAway = useCallback(() => {
    setOpenDropdown(false);
  }, []);

  // ---------------------------------------------
  // presentation
  // ---------------------------------------------
  switch (status) {
    case WalletStatus.INITIALIZING:
      return (
        <div className={className}>
          <NotConnectedButton disabled>
            Initializing Wallet...
          </NotConnectedButton>
        </div>
      );
    case WalletStatus.WALLET_NOT_CONNECTED:
      return (
        <ClickAwayListener onClickAway={onClickAway}>
          <div className={className}>
            <NotConnectedButton onClick={connectWallet}>
              Connect Wallet
            </NotConnectedButton>

            {openDropdown && (
              <DropdownContainer>
                <DropdownBox>
                  <ConnectTypeContent>
                    {availableConnectTypes.some(
                      (connectType) => connectType === ConnectType.WEBEXTENSION,
                    ) ? (
                      <FlatButton
                        className="connect-chrome-extension"
                        onClick={() => {
                          connect(ConnectType.WEBEXTENSION);
                          setOpenDropdown(false);
                        }}
                      >
                        <IconSpan>
                          <Terra />
                          Terra Station (extension)
                        </IconSpan>
                      </FlatButton>
                    ) : availableConnectTypes.some(
                        (connectType) =>
                          connectType === ConnectType.CHROME_EXTENSION,
                      ) ? (
                      <FlatButton
                        className="connect-chrome-extension"
                        onClick={() => {
                          connect(ConnectType.CHROME_EXTENSION);
                          setOpenDropdown(false);
                        }}
                      >
                        <IconSpan>
                          <Terra />
                          Terra Station (extension)
                        </IconSpan>
                      </FlatButton>
                    ) : availableInstallTypes.some(
                        (connectType) =>
                          connectType === ConnectType.CHROME_EXTENSION,
                      ) ? (
                      <BorderButton
                        className="install-chrome-extension"
                        onClick={() => {
                          install(ConnectType.CHROME_EXTENSION);
                          setOpenDropdown(false);
                        }}
                      >
                        <IconSpan>
                          <Terra />
                          Install Chrome Extension
                        </IconSpan>
                      </BorderButton>
                    ) : null}

                    {availableConnectTypes.some(
                      (connectType) =>
                        connectType === ConnectType.WALLETCONNECT,
                    ) && (
                      <FlatButton
                        className="connect-walletconnect"
                        onClick={() => {
                          connect(ConnectType.WALLETCONNECT);
                          setOpenDropdown(false);
                        }}
                      >
                        <IconSpan>
                          <Walletconnect />
                          Terra Station (mobile)
                        </IconSpan>
                      </FlatButton>
                    )}

                    <hr />

                    {availableConnectTypes.some(
                      (connectType) => connectType === ConnectType.READONLY,
                    ) && (
                      <BorderButton
                        className="connect-readonly"
                        onClick={() => {
                          connect(ConnectType.READONLY);
                          setOpenDropdown(false);
                        }}
                      >
                        View an address
                      </BorderButton>
                    )}
                  </ConnectTypeContent>
                </DropdownBox>
              </DropdownContainer>
            )}
          </div>
        </ClickAwayListener>
      );
    case WalletStatus.WALLET_CONNECTED:
      return wallets.length > 0 ? (
        <ClickAwayListener onClickAway={onClickAway}>
          <div className={className}>
            <ConnectedButton
              walletAddress={wallets[0].terraAddress}
              bank={bank}
              onClick={toggleOpen}
            />

            {!airdropClosed &&
              airdrop &&
              airdrop !== 'in-progress' &&
              !openDropdown &&
              !matchAirdrop && (
                <DropdownContainer>
                  <DropdownBox>
                    <AirdropContent onClose={closeAirdrop} />
                  </DropdownBox>
                </DropdownContainer>
              )}

            {openDropdown && (
              <DropdownContainer>
                <DropdownBox>
                  <WalletDetailContent
                    connectType={wallets[0].connectType}
                    bank={bank}
                    availablePost={
                      wallets[0].connectType === ConnectType.WEBEXTENSION ||
                      wallets[0].connectType === ConnectType.CHROME_EXTENSION ||
                      wallets[0].connectType === ConnectType.WALLETCONNECT
                    }
                    walletAddress={wallets[0].terraAddress}
                    network={network}
                    closePopup={() => setOpenDropdown(false)}
                    disconnectWallet={disconnectWallet}
                    openSend={() => openSendDialog({})}
                  />
                </DropdownBox>
              </DropdownContainer>
            )}

            {sendDialogElement}
          </div>
        </ClickAwayListener>
      ) : null;
  }
}

export const WalletSelector = styled(WalletSelectorBase)`
  display: inline-block;
  position: relative;
  text-align: left;
`;

const ConnectTypeContent = styled.section`
  padding: 32px 28px;

  display: flex;
  flex-direction: column;

  button {
    width: 100%;
    height: 32px;

    font-size: 12px;
    font-weight: 700;

    &.connect-chrome-extension,
    &.install-chrome-extension {
      margin-bottom: 8px;
    }

    svg,
    .MuiSvgIcon-root {
      //transform: scale(1.2) translateY(0.13em);
      margin-right: 0.4em;
    }
  }

  hr {
    margin: 12px 0;

    border: 0;
    border-bottom: 1px dashed
      ${({ theme }) =>
        theme.palette.type === 'light'
          ? '#e5e5e5'
          : 'rgba(255, 255, 255, 0.1)'};
  }

  .connect-chrome-extension,
  .connect-walletconnect {
    background-color: ${({ theme }) => theme.colors.positive};
  }

  .install-chrome-extension {
    border: 1px solid ${({ theme }) => theme.colors.positive};
    color: ${({ theme }) => theme.colors.positive};
  }

  .connect-readonly {
    border: 1px solid ${({ theme }) => theme.dimTextColor};
    color: ${({ theme }) => theme.dimTextColor};
  }
`;
