import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup as MuiRadioGroup } from "@mui/material";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  label: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  row?: boolean;
}

const RadioGroup = ({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  row = true,
}: RadioGroupProps) => {
  return (
    <FormControl required={required} disabled={disabled}>
      <FormLabel>{label}</FormLabel>
      <MuiRadioGroup
        value={value}
        row={row}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </MuiRadioGroup>
    </FormControl>
  );
};

export default RadioGroup;
