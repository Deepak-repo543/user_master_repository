
import React, { useMemo, useState } from "react";
import { Box, Chip, Tooltip } from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef, type MRT_PaginationState, type MRT_SortingState, type MRT_RowSelectionState, type MRT_Row, } from "material-react-table";
import { alpha } from "@mui/material/styles";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

interface ReactMaterialTableProps<T extends Record<string, any>> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  page: number;
  rowsPerPage: number;
  totalElements: number;
  fillHeight?: boolean;
  onPageChange: (page: number, rowsPerPage: number) => void;
  onRowsPerPageChange: (value: number) => void;
  onSortChange?: ( sortBy: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string;
  enableRowSelection?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  renderDetailPanel?: (row: T) => React.ReactNode;
  enableColumnResizing?: boolean;
  enableGlobalFilter?: boolean;
  renderToolbarActions?: (selectedRows: T[]) => React.ReactNode;
  rowsPerPageOptions?: number[];
  entityLabel?: string;
}

const ReactMaterialTable = < T extends Record<string, any>>({
  data,
  columns,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  fillHeight,
  onRowsPerPageChange,
  onSortChange,
  onRowClick,
  getRowId,
  enableRowSelection = false,
  onSelectionChange,
  renderDetailPanel,
  enableColumnResizing = false,
  enableGlobalFilter = false,
  renderToolbarActions,
  rowsPerPageOptions = [5, 10, 25, 50],
  entityLabel = "Rows",
}: ReactMaterialTableProps<T>) => {
  const [sorting, setSorting] =
    useState<MRT_SortingState>([
      {
        id: "id",
        desc: false,
      },
    ]);

  const [rowSelection, setRowSelection] =
    useState<MRT_RowSelectionState>({});

  const pagination: MRT_PaginationState = {
    pageIndex: page,
    pageSize: rowsPerPage,
  };

  const resolveRowId = useMemo(
    () =>
      getRowId ??
      ((row: T) => String(row.id ?? "")),
    [getRowId]
  );

  const selectedRows = useMemo(() => {
    if (!enableRowSelection) {
      return [];
    }

    const selectedIds = new Set(
      Object.entries(rowSelection)
        .filter(([, isSelected]) => isSelected)
        .map(([id]) => id)
    );

    return data.filter((row) =>
      selectedIds.has(resolveRowId(row))
    );
  }, [
    rowSelection,
    data,
    enableRowSelection,
    resolveRowId,
  ]);

  const handleSortingChange = (
    updater:
      | MRT_SortingState
      | ((
        old: MRT_SortingState
      ) => MRT_SortingState)
  ) => {
    const newSorting =
      typeof updater === "function"
        ? updater(sorting)
        : updater;

    setSorting(newSorting);

    if (!onSortChange) {
      return;
    }

    if (newSorting.length === 0) {
      onSortChange("id", "asc");
      return;
    }

    const currentSort = newSorting[0];

    onSortChange(
      currentSort.id,
      currentSort.desc ? "desc" : "asc"
    );
  };

  const handlePaginationChange = (
    updater:
      | MRT_PaginationState
      | ((
        old: MRT_PaginationState
      ) => MRT_PaginationState)
  ) => {
    const newPagination =
      typeof updater === "function"
        ? updater(pagination)
        : updater;

    if (
      newPagination.pageSize !== rowsPerPage
    ) {
      onRowsPerPageChange(
        newPagination.pageSize
      );
      return;
    }

    if (
      newPagination.pageIndex !== page
    ) {
      onPageChange(
        newPagination.pageIndex,
        newPagination.pageSize
      );
    }
  };

  const handleRowSelectionChange = (
    updater:
      | MRT_RowSelectionState
      | ((
        old: MRT_RowSelectionState
      ) => MRT_RowSelectionState)
  ) => {
    const next =
      typeof updater === "function"
        ? updater(rowSelection)
        : updater;

    setRowSelection(next);

    if (!onSelectionChange) {
      return;
    }

    const selectedIds = new Set(
      Object.entries(next)
        .filter(([, isSelected]) => isSelected)
        .map(([id]) => id)
    );

    onSelectionChange(
      data.filter((row) =>
        selectedIds.has(resolveRowId(row))
      )
    );
  };

  const clearSelection = () => {
    handleRowSelectionChange({});
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
        ...(fillHeight
          ? {
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            "& > .MuiPaper-root": {
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            },
          }
          : {}),
        "& .MuiTableContainer-root": {
          scrollbarWidth: "thin",
        },
      }}
    >
      <MaterialReactTable
        columns={columns}
        data={data}

        manualPagination
        manualSorting

        rowCount={totalElements}

        getRowId={(row) =>
          resolveRowId(row as T)
        }

        state={{
          pagination,
          sorting,
          ...(enableRowSelection
            ? { rowSelection }
            : {}),
        }}

        onPaginationChange={
          handlePaginationChange
        }

        onSortingChange={
          handleSortingChange
        }

        onRowSelectionChange={
          enableRowSelection
            ? handleRowSelectionChange
            : undefined
        }

        enableColumnActions={false}
        enableHiding={false}
        enableTopToolbar
        enableBottomToolbar
        enableColumnResizing={
          enableColumnResizing
        }
        enableFilters={false}
        enableGlobalFilter={
          enableGlobalFilter
        }
        enableDensityToggle={false}
        enableFullScreenToggle={false}

        enableRowSelection={
          enableRowSelection
        }

        enableExpanding={Boolean(
          renderDetailPanel
        )}

        renderDetailPanel={
          renderDetailPanel
            ? ({
              row,
            }: {
              row: MRT_Row<T>;
            }) =>
              renderDetailPanel(
                row.original
              )
            : undefined
        }

        enableStickyHeader

        initialState={{
          density: "compact",
          columnPinning: {
            left: ["actions"],
          },
        }}

        muiTablePaperProps={{
          sx: {
            maxWidth: "100%",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            borderRadius: 2.5,
            bgcolor: "#FFFFFF",
            overflow: "hidden",
            border: "1px solid #E2E8F0",
            ...(fillHeight
              ? { height: "100%", display: "flex", flexDirection: "column" }
              : {}),
          },
        }}

        muiSelectCheckboxProps={{
          sx: {
            color: "#94A3B8",

            "&.Mui-checked": {
              color: "#4F46E5",
            },

            "&.MuiCheckbox-indeterminate": {
              color: "#4F46E5",
            },

            "&:hover": {
              bgcolor: alpha(
                "#6366F1",
                0.08
              ),
            },
          },
        }}

        muiSelectAllCheckboxProps={{
          sx: {
            color: "#94A3B8",

            "&.Mui-checked": {
              color: "#4F46E5",
            },

            "&.MuiCheckbox-indeterminate": {
              color: "#4F46E5",
            },

            "&:hover": {
              bgcolor: alpha(
                "#6366F1",
                0.08
              ),
            },
          },
        }}

        muiExpandButtonProps={{
          sx: {
            color: "#64748B",
            width: 32,
            height: 32,
            borderRadius: 1.5,

            "&:hover": {
              color: "#4F46E5",
              bgcolor: alpha(
                "#6366F1",
                0.08
              ),
            },
          },
        }}

        muiPaginationProps={{
          rowsPerPageOptions,
          showFirstButton: true,
          showLastButton: true,

          sx: {
            "& .MuiTablePagination-root": {
              color: "#1F2937",
            },

            "& .MuiTablePagination-toolbar": {
              minHeight: 48,
              px: 1.5,
            },

            "& .MuiTablePagination-displayedRows":
            {
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#64748B",
            },

            "& .MuiTablePagination-selectLabel":
            {
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#64748B",
            },

            "& .MuiTablePagination-select": {
              fontSize: "0.72rem",
              fontWeight: 600,
              borderRadius: 1,

              "&:hover": {
                bgcolor: alpha(
                  "#6366F1",
                  0.04
                ),
              },
            },

            "& .MuiIconButton-root": {
              color: "#64748B",
              borderRadius: 1.5,

              "&:hover": {
                bgcolor: alpha(
                  "#6366F1",
                  0.08
                ),
                color: "#4F46E5",
              },

              "&.Mui-disabled": {
                color: "#CBD5E1",
              },
            },
          },
        }}

        muiTableContainerProps={{
          sx: {
            ...(fillHeight
              ? { flex: 1, minHeight: 0, maxHeight: "none" }
              : { maxHeight: 450 }),
            overflowX: "auto",
            overflowY: "auto",
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            position: "relative",

            "&::-webkit-scrollbar": {
              height: 7,
              width: 7,
            },

            "&::-webkit-scrollbar-track": {
              background: "#F8FAFC",
              borderRadius: 10,
            },

            "&::-webkit-scrollbar-thumb": {
              background: "#CBD5E1",
              borderRadius: 10,

              "&:hover": {
                background: "#94A3B8",
              },
            },
          },
        }}

        muiTableProps={{
          sx: {
            tableLayout: fillHeight ? "auto" : "fixed",
            width: fillHeight ? "max-content" : "100%",
            minWidth: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,

            "& .MuiTableCell-root": {
              borderBottom:
                "1px solid #F1F5F9",
            },
          },
        }}

        muiTableHeadProps={{
          sx: {
            "& .MuiTableCell-root": {
              borderBottom:
                "1px solid #E2E8F0",
            },
          },
        }}

        muiTableHeadCellProps={{
          sx: {
            bgcolor: "#191970",
            color: "#FFFFFF",
            fontSize: "0.72rem",
            fontWeight: 750,
            whiteSpace: "nowrap",
            padding: "11px 14px",
            textTransform: "uppercase",
            letterSpacing: "0.45px",
            borderBottom:
              "1px solid #E2E8F0",

            position: "sticky",
            top: 0,
            zIndex: 2,

            transition:
              "background-color 0.15s ease",

            "& .Mui-TableHeadCell-Content":
            {
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
            },

            "& .Mui-TableHeadCell-Content-Labels":
            {
              justifyContent: "center",
              width: "100%",
            },

            "& .Mui-TableHeadCell-Content-Wrapper":
            {
              justifyContent: "center",
              textAlign: "center",
            },

            "& .MuiTableSortLabel-root": {
              fontSize: "0.72rem",
              fontWeight: 700,
              justifyContent: "center",
              color: "#64748B",

              "&:hover": {
                color: "#0F172A",
              },
            },

            "& .MuiTableSortLabel-root.Mui-active":
            {
              color: "#4F46E5",
              fontWeight: 800,
            },

            "& .MuiTableSortLabel-icon": {
              color:
                "#6366F1 !important",
              fontSize:
                "0.9rem !important",
            },

            "&:hover": {
              bgcolor: "#F1F5F9",
            },

            "&:first-of-type": {
              borderTopLeftRadius: 8,
            },

            "&:last-of-type": {
              borderTopRightRadius: 8,
            },
          },
        }}

        muiTableBodyCellProps={{
          sx: {
            bgcolor: "#FFFFFF",
            fontSize: "0.79rem",
            color: "#334155",
            textAlign: "center !important",
            justifyContent: "center",
            alignItems: "center",
            whiteSpace: "nowrap",
            padding: "9px 12px",
            borderBottom: "1px solid #F1F5F9",

            transition:
              "background-color 0.15s ease",

            "& .MuiBox-root": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            },

            "&:first-of-type": {
              borderLeft: "none",
            },

            "&:last-of-type": {
              borderRight: "none",
            },
          },
        }}

        muiTableBodyRowProps={({ row }) => {
          const isSelected =
            enableRowSelection &&
            row.getIsSelected();

          return {
            hover: Boolean(onRowClick),

            onClick: (event) => {
              const target =
                event.target as HTMLElement;

              const isInteractiveElement =
                target.closest(
                  "button, a, input, textarea, select, [role='button'], [role='checkbox']"
                );

              if (isInteractiveElement) {
                return;
              }

              onRowClick?.(row.original);
            },

            sx: {
              cursor: onRowClick
                ? "pointer"
                : "default",

              transition:
                "background-color 0.15s ease, box-shadow 0.15s ease",

              bgcolor: isSelected
                ? alpha("#6366F1", 0.06)
                : undefined,

              "&:hover": {
                bgcolor: isSelected
                  ? alpha("#6366F1", 0.09)
                  : onRowClick
                    ? alpha("#6366F1", 0.035)
                    : undefined,

                "& .MuiTableCell-root": {
                  bgcolor: "transparent",
                },
              },

              "&:hover td": {
                borderBottomColor: alpha(
                  "#6366F1",
                  0.12
                ),
              },

              "&:focus-within": {
                outline: "2px solid #6366F1",
                outlineOffset: "-2px",
              },

              "&:last-child .MuiTableCell-root": {
                borderBottom: "none",
              },

              "&:nth-of-type(even)": {
                bgcolor: isSelected
                  ? alpha("#6366F1", 0.06)
                  : "#FFFFFF",

                "&:hover": {
                  bgcolor: isSelected
                    ? alpha("#6366F1", 0.09)
                    : onRowClick
                      ? alpha("#6366F1", 0.035)
                      : "#FFFFFF",
                },
              },
            },
          };
        }}

        muiBottomToolbarProps={{
          sx: {
            borderTop:
              "1px solid #E8EDF4",
            minHeight: 50,
            bgcolor: "#FAFBFC",
            borderRadius:
              "0 0 10px 10px",
            px: 1.5,
            py: 0.5,

            "& .MuiTypography-root": {
              fontSize: "0.72rem",
              color: "#64748B",
            },
          },
        }}

        muiTopToolbarProps={{
          sx: {
            bgcolor: "#FFFFFF",
            borderBottom:
              "1px solid #E8EDF4",
            px: 1.5,
            py: 0.75,
            minHeight: 48,

            "& .MuiTextField-root": {
              bgcolor: "#FFFFFF",
              borderRadius: 1.5,

              "& .MuiOutlinedInput-root":
              {
                borderRadius: 1.5,
                fontSize: "0.75rem",
                minHeight: 34,

                "& fieldset": {
                  borderColor:
                    "#E2E8F0",
                },

                "&:hover fieldset": {
                  borderColor:
                    "#94A3B8",
                },

                "&.Mui-focused fieldset":
                {
                  borderColor:
                    "#6366F1",
                  borderWidth: 1.5,
                },
              },
            },

            "& .MuiButton-root": {
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "none",
              color: "#64748B",
              padding: "4px 10px",
              minHeight: 34,
              borderRadius: 1.5,

              "&:hover": {
                bgcolor: alpha(
                  "#6366F1",
                  0.06
                ),
                color: "#4F46E5",
              },
            },
          },
        }}

        positionToolbarAlertBanner="none"

        renderTopToolbarCustomActions={() => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              ml: 0.5,
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            <Chip
              label={`${data.length} ${entityLabel}`}
              size="small"
              sx={{
                height: 25,
                bgcolor: "#EEF2FF",
                color: "#4F46E5",
                fontSize: "0.69rem",
                fontWeight: 650,
                border:
                  "1px solid #E0E7FF",

                "& .MuiChip-label": {
                  px: 1.1,
                },
              }}
            />

            {totalElements >
              data.length && (
                <Chip
                  label={`${totalElements} Total`}
                  size="small"
                  sx={{
                    height: 25,
                    bgcolor: "#F8FAFC",
                    color: "#64748B",
                    fontSize: "0.69rem",
                    fontWeight: 550,
                    border:
                      "1px solid #E2E8F0",

                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
              )}

            {enableRowSelection &&
              selectedRows.length >
              0 && (
                <Chip
                  label={`${selectedRows.length} selected`}
                  size="small"
                  onDelete={
                    clearSelection
                  }
                  deleteIcon={
                    <Tooltip title="Clear selection">
                      <ClearRoundedIcon
                        sx={{
                          fontSize:
                            "0.9rem !important",
                        }}
                      />
                    </Tooltip>
                  }
                  sx={{
                    height: 25,
                    bgcolor: "#FEF3C7",
                    color: "#92400E",
                    fontSize: "0.69rem",
                    fontWeight: 650,
                    border:
                      "1px solid #FDE68A",

                    "& .MuiChip-label": {
                      px: 1,
                    },

                    "& .MuiChip-deleteIcon":
                    {
                      color:
                        "#92400E",

                      "&:hover": {
                        color:
                          "#78350F",
                      },
                    },
                  }}
                />
              )}

            {renderToolbarActions?.(
              selectedRows
            )}
          </Box>
        )}

        displayColumnDefOptions={{
          "mrt-row-actions": {
            header: "Actions",
            size: 80,
            grow: false,
          },

          "mrt-row-select": {
            size: 44,
            grow: false,
          },

          "mrt-row-expand": {
            size: 44,
            grow: false,
          },
        }}

        localization={{
          noRecordsToDisplay:
            "No records found",
          rowsPerPage: "Rows per page",
          of: "of",
        }}
      />
    </Box>
  );
};

export default ReactMaterialTable;

