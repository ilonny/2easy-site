export const FREE_INPUT_CORRECTION_COLORS = [
  "#FFEB3B",
  "#FFCDD2",
  "#C8E6C9",
  "#BBDEFB",
  "#E1BEE7",
  "#FFCCBC",
  "#F44336",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF9800",
  "#000000",
  "#616161",
  "#FFFFFF",
];

export const FREE_INPUT_TEACHER_TOOLBAR = {
  options: ["inline", "colorPicker", "remove"],
  inline: {
    options: ["bold", "italic", "underline", "strikethrough"],
  },
  colorPicker: {
    colors: FREE_INPUT_CORRECTION_COLORS,
  },
};

export const FREE_INPUT_EMPTY_TOOLBAR = {
  options: [] as string[],
};
