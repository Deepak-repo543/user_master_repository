import { Button, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useRef } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const FileUpload = ({
  label = "Attachment",
  accept,
  onChange,
  disabled = false,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onChange(file);
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        onChange={handleFileChange}
      />
      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
    </Box>
  );
};

export default FileUpload;
