import { TextField } from "@mui/material";

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  rows?: number;
  fullWidth?: boolean;
}

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  helperText,
  rows = 4,
  fullWidth = true,
}: TextAreaProps) => {
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
      multiline
      rows={rows}
      fullWidth={fullWidth}
    />
  );
};

export default TextArea;
