import { Autocomplete, TextField } from "@mui/material";

interface AutoCompleteOption {
  label: string;
  value: string | number;
}

interface MultiAutoCompleteProps {
  label: string;
  value: AutoCompleteOption[];
  options: AutoCompleteOption[];
  onChange: (value: AutoCompleteOption[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const MultiAutoComplete = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  helperText,
}: MultiAutoCompleteProps) => {
  return (
    <Autocomplete
      multiple
      value={value}
      options={options}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={(option) => option.label}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};

export default MultiAutoComplete;
