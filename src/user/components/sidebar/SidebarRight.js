import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Slider,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import ButtonUpload from "../upload/ButtonUpload";
import fonts from "../../../utils/fonts";

const SidebarRight = ({
  selectedComponent,
  handleTextChange,
  handleStyleChange,
  handleFileUpload,
}) => {
  const [selectedFont, setSelectedFont] = useState(
    selectedComponent?.style?.fontFamily || "Arial"
  );

  useEffect(() => {
    if (
      selectedComponent?.type === "text" &&
      selectedComponent.style?.fontFamily
    ) {
      const currentFont = fonts.find(
        (font) => font.family === selectedComponent.style.fontFamily
      );
      if (currentFont) {
        setSelectedFont(selectedComponent.style.fontFamily);
      }
    }
  }, [selectedComponent]);

  if (!selectedComponent) return null;

  return (
    <Box
      sx={{
        marginTop: "60px",
        position: "fixed",
        top: 0,
        right: 0,
        width: "300px",
        height: "100vh",
        background: "#f9f9f9",
        padding: " 20px 16px",
        border: "1px solid #ccc",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Typography variant="h6" component="h3">
        Edit Component
      </Typography>

      {selectedComponent?.type === "text" && (
        <>
          <TextField
            label="Text"
            value={selectedComponent.text || ""}
            onChange={(e) => {
              handleTextChange(e.target.value);
            }}
            fullWidth
            variant="outlined"
          />
          <TextField
            type="color"
            label="Font Color"
            value={selectedComponent.style?.color || "#000000"}
            onChange={(e) => handleStyleChange("color", e.target.value)}
            fullWidth
            variant="outlined"
          />
          <Typography variant="subtitle1" sx={{ marginBottom: 1 }}>
            Font Size
          </Typography>
          <Slider
            value={selectedComponent.style?.fontSize || 16}
            onChange={(e, value) => {
              handleStyleChange("fontSize", value);
            }}
            min={10}
            max={72}
            step={1}
          />
          <Select
            value={selectedFont}
            onChange={(e) => {
              const selectedFontFamily = e.target.value;
              handleStyleChange("fontFamily", selectedFontFamily);
              setSelectedFont(selectedFontFamily);
            }}
            fullWidth
            displayEmpty
            variant="outlined"
          >
            {fonts.map((font) => (
              <MenuItem
                key={font.value}
                value={font.family}
                style={{ fontFamily: font.family }}
              >
                {font.label}
              </MenuItem>
            ))}
          </Select>
        </>
      )}

      {selectedComponent.type === "image" && (
        <ButtonUpload handleFileUpload={handleFileUpload} />
      )}
    </Box>
  );
};

export default SidebarRight;
