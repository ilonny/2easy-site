export const BOARD_BG_COLOR = "#ffffff";

export const BOARD_DEFAULT_GRID_SIZE = 20;
export const BOARD_DEFAULT_GRID_STEP = 5;

export const BOARD_GRID_APP_STATE: Record<string, unknown> = {
  gridModeEnabled: true,
  viewBackgroundColor: BOARD_BG_COLOR,
  gridSize: BOARD_DEFAULT_GRID_SIZE,
  gridStep: BOARD_DEFAULT_GRID_STEP,
};

export const mergeBoardEditorAppState = (
  saved?: Record<string, unknown>,
): Record<string, unknown> => {
  const {
    scrollX: _scrollX,
    scrollY: _scrollY,
    zoom: _zoom,
    gridModeEnabled: _gridModeEnabled,
    viewBackgroundColor: _viewBackgroundColor,
    ...savedState
  } = { ...(saved || {}) };

  return {
    ...savedState,
    ...BOARD_GRID_APP_STATE,
    gridSize: savedState.gridSize ?? BOARD_DEFAULT_GRID_SIZE,
    gridStep: savedState.gridStep ?? BOARD_DEFAULT_GRID_STEP,
  };
};
