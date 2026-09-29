import React, { useState } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import { BarChart as BarChartIcon, TableChart as TableChartIcon, } from "@mui/icons-material";
import type { MRT_ColumnDef } from "material-react-table";
import ReactMaterialTable from "@/components/react-material-table";

interface ChartTableCardProps<T extends Record<string, any>> {
  title: string;
  chart: React.ReactNode;
  columns: MRT_ColumnDef<T>[];
  data: T[];
  defaultView?: "graph" | "table";
  onRowClick?: (row: T) => void;
}

const ChartTableCard = <T extends Record<string, any>>({
  title,
  chart,
  columns,
  data,
  defaultView = "graph",
  onRowClick,
}: ChartTableCardProps<T>) => {
  const [view, setView] = useState<"graph" | "table">(defaultView);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#172033" }}>
            {title}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            backgroundColor: "#F1F5F9",
            borderRadius: 2,
            p: 0.5,
            gap: 0.5,
            border: "1px solid #E2E8F0",
          }}
        >
          <ButtonBase
            onClick={() => setView("graph")}
            sx={{
              px: 2.5,
              py: 0.75,
              borderRadius: 1.5,
              fontSize: 13,
              fontWeight: 600,
              gap: 1,
              color: view === "graph" ? "#FFFFFF" : "#64748B",
              backgroundColor: view === "graph" ? "#6366F1" : "transparent",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: view === "graph" ? "0 4px 12px #6366F140" : "none",
              "&:hover": {
                backgroundColor: view === "graph" ? "#6366F1" : "#E2E8F0",
                transform: "scale(1.02)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          >
            <BarChartIcon sx={{ fontSize: 18 }} />
            Graph
          </ButtonBase>

          <ButtonBase
            onClick={() => setView("table")}
            sx={{
              px: 2.5,
              py: 0.75,
              borderRadius: 1.5,
              fontSize: 13,
              fontWeight: 600,
              gap: 1,
              color: view === "table" ? "#FFFFFF" : "#64748B",
              backgroundColor: view === "table" ? "#6366F1" : "transparent",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: view === "table" ? "0 4px 12px #6366F140" : "none",
              "&:hover": {
                backgroundColor: view === "table" ? "#6366F1" : "#E2E8F0",
                transform: "scale(1.02)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          >
            <TableChartIcon sx={{ fontSize: 18 }} />
            Table
          </ButtonBase>
        </Box>
      </Box>

      {view === "graph" ? (
        chart
      ) : (
        <ReactMaterialTable<T>
          data={data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalElements={data.length}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(0);
          }}
          onRowClick={onRowClick}
        />
      )}
    </Box>
  );
};

export default ChartTableCard;