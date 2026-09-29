import { Autocomplete, TextField } from "@mui/material";

interface AutoCompleteOption {
  label: string;
  value: string | number;
}

interface AutoCompleteProps {
  label: string;
  value: AutoCompleteOption | null;
  options: AutoCompleteOption[];
  onChange: (value: AutoCompleteOption | null) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const AutoComplete = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
}: AutoCompleteProps) => {
  return (
    <Autocomplete
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
          required={required}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};

export default AutoComplete;
