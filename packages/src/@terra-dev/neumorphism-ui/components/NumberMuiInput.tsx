import { Input, InputProps } from '@material-ui/core';
import {
  RestrictedNumberInputParams,
  useRestrictedNumberInput,
} from '@terra-dev/use-restricted-input';

export type NumberMuiInputProps = Omit<InputProps, 'type'> &
  RestrictedNumberInputParams;

export function NumberMuiInput({
  type = 'decimal',
  maxDecimalPoints,
  maxIntegerPoinsts,
  onChange,
  inputMode = type === 'decimal' ? 'decimal' : 'numeric',
  pattern = '[0-9.]*',
  ...props
}: NumberMuiInputProps) {
  const handlers = useRestrictedNumberInput({
    type,
    maxIntegerPoinsts,
    maxDecimalPoints,
    onChange,
  });
  return (
    <Input
      {...props}
      type="text"
      inputProps={{
        inputMode,
        pattern,
      }}
      {...handlers}
    />
  );
}
