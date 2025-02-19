import styled from 'styled-components';

const mobileLayoutBreak = 950;

export const DropdownContainer = styled.div`
  position: absolute;
  display: block;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  > :not(:last-child) {
    margin-bottom: 15px;
  }

  @media (max-width: ${mobileLayoutBreak}px) {
    transform: translateX(-65%);
  }
`;

export const DropdownBox = styled.div`
  min-width: 260px;

  border: 1px solid ${({ theme }) => theme.highlightBackgroundColor};
  background-color: ${({ theme }) => theme.highlightBackgroundColor};
  box-shadow: 0 0 21px 4px rgba(0, 0, 0, 0.3);
  border-radius: 15px;

  button {
    cursor: pointer;
  }
`;
