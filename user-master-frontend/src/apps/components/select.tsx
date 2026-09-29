import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select as MuiSelect } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  value: string | string[];
  options: SelectOption[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Select = ({
  label,
  value,
  options,
  onChange,
  multiple = false,
  required = false,
  disabled = false,
  fullWidth = true,
}: SelectProps) => {
  const handleChange = (event: SelectChangeEvent<string | string[]>) => {
    const selectedValue = event.target.value;
    if (multiple) {
      onChange(
        typeof selectedValue === "string"
          ? selectedValue.split(",")
          : selectedValue,
      );
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <FormControl fullWidth={fullWidth} required={required} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        value={value}
        label={label}
        multiple={multiple}
        onChange={handleChange}
        renderValue={(selected) =>
          multiple ? (selected as string[]).join(", ") : String(selected)
        }
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {multiple && (
              <Checkbox checked={(value as string[]).includes(option.value)} />
            )}

            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
};

export default Select;
