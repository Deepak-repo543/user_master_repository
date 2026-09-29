import { Checkbox as MuiCheckbox, FormControlLabel } from "@mui/material";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxProps) => {
  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
        />
      }
      label={label}
    />
  );
};

export default Checkbox;
