import { Menu, MenuClose, MenuWallet } from '@anchor-protocol/icons';
import { Launch } from '@material-ui/icons';
import { isMathWallet } from '@terra-dev/mathwallet';
import { IconSpan } from '@terra-dev/neumorphism-ui/components/IconSpan';
import { IconToggleButton } from '@terra-dev/neumorphism-ui/components/IconToggleButton';
import {
  ConnectType,
  useWallet,
  WalletStatus,
} from '@terra-money/wallet-provider';
import logoUrl from 'components/Header/assets/Logo.svg';
import { useWalletDetailDialog } from 'components/Header/WalletSelector/useWalletDetailDialog';
import { links, mobileHeaderHeight } from 'env';
import { govPathname } from 'pages/gov/env';
import { useSendDialog } from 'pages/send/useSendDialog';
import React, { useCallback, useState } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

export interface MobileHeaderProps {
  className?: string;
}

function MobileHeaderBase({ className }: MobileHeaderProps) {
  const [open, setOpen] = useState<boolean>(false);

  const { status, connect } = useWallet();

  const [openWalletDetail, walletDetailElement] = useWalletDetailDialog();

  const [openSendDialog, sendDialogElement] = useSendDialog();

  const toggleWallet = useCallback(() => {
    if (status === WalletStatus.WALLET_CONNECTED) {
      openWalletDetail({
        openSend: () => openSendDialog({}),
      });
    } else if (status === WalletStatus.WALLET_NOT_CONNECTED) {
      connect(
        isMathWallet(navigator.userAgent)
          ? ConnectType.CHROME_EXTENSION
          : ConnectType.WALLETCONNECT,
      );
    }
  }, [connect, openSendDialog, openWalletDetail, status]);

  return (
    <>
      <header className={className} data-open={open}>
        {open && (
          <nav>
            <NavMenu
              to="/earn"
              title="EARN"
              docsTo={links.earn}
              close={() => setOpen(false)}
            />
            <NavMenu
              to="/borrow"
              title="BORROW"
              docsTo={links.borrow}
              close={() => setOpen(false)}
            />
            <NavMenu
              to="/bond"
              title="BOND"
              docsTo={links.bond}
              close={() => setOpen(false)}
            />
            <NavMenu
              to={`/${govPathname}`}
              title="GOVERN"
              docsTo={links.gov}
              close={() => setOpen(false)}
            />
          </nav>
        )}
        <section className="header">
          <a className="logo" href="https://anchorprotocol.com/dashboard">
            <img src={logoUrl} alt="logo" />
          </a>

          <div />

          <IconToggleButton
            on={!!walletDetailElement}
            onChange={(open) => {
              open && toggleWallet();
            }}
            onIcon={MenuWallet}
            offIcon={MenuWallet}
          />

          <IconToggleButton
            on={open}
            onChange={setOpen}
            onIcon={MenuClose}
            offIcon={Menu}
          />
        </section>
      </header>

      {open && <div style={{ height: mobileHeaderHeight }} />}

      {walletDetailElement}
      {sendDialogElement}
    </>
  );
}

function NavMenu({
  to,
  docsTo,
  title,
  close,
}: {
  to: string;
  docsTo: string;
  title: string;
  close: () => void;
}) {
  const match = useRouteMatch(to);

  return (
    <div data-active={!!match}>
      <NavLink to={to} onClick={close}>
        {title}
      </NavLink>
      <a href={docsTo} target="_blank" rel="noreferrer" onClick={close}>
        <IconSpan>
          Docs <Launch />
        </IconSpan>
      </a>
    </div>
  );
}

const slide = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0.7;
  }
  
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const MobileHeader = styled(MobileHeaderBase)`
  // ---------------------------------------------
  // style
  // ---------------------------------------------
  > section.header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    background-color: #101010;

    a {
      text-decoration: none;
      color: #555555;
    }

    button {
      color: #555555;

      &[data-on='true'] {
        color: #ffffff;
      }
    }

    div:empty {
      flex: 1;
    }
  }

  > nav {
    background-color: #101010;

    > div {
      display: flex;
      align-items: center;

      a:first-child {
        flex: 1;

        font-size: 36px;
        font-weight: 700;
        letter-spacing: -0.2px;
        text-decoration: none;

        color: #666666;

        &.active {
          color: #f4f4f5;
        }
      }

      a:last-child {
        font-size: 16px;
        text-decoration: none;

        color: #666666;

        svg {
          font-size: 1em;
        }
      }
    }
  }

  // ---------------------------------------------
  // layout
  // ---------------------------------------------
  > section.header {
    position: relative;
    height: ${mobileHeaderHeight}px;
    padding: 0 20px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    a.logo {
      img {
        width: 28px;
        height: 28px;
      }
    }

    button {
      &:last-child {
        margin-left: 30px;
      }
    }

    svg {
      font-size: 26px;
    }
  }

  > nav {
    position: absolute;
    top: ${mobileHeaderHeight}px;
    left: 0;
    width: 100vw;
    height: calc(100vh - ${mobileHeaderHeight}px);

    display: flex;
    flex-direction: column;
    padding: 24px;

    a {
      margin-bottom: 12px;
    }

    button {
      margin-top: 30px;
    }

    animation: ${slide} 0.3s cubic-bezier(0.655, 1.075, 0.8, 0.995);
  }

  &[data-open='true'] {
    position: fixed;
    z-index: 10000;
    top: 0;
    width: 100vw;
  }
`;
