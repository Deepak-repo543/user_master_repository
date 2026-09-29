import { TextField } from "@mui/material";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  type?: string;
  fullWidth?: boolean;
}

const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
  type = "text",
  fullWidth = true,
}: TextInputProps) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      type={type}
      fullWidth={fullWidth}
    />
  );
};

export default TextInput;
