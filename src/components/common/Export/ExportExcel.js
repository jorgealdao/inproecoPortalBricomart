import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExportPanel } from "@devexpress/dx-react-grid-bootstrap4";
import { GridExporter } from "@devexpress/dx-react-grid-export";
import {
  Template,
  TemplatePlaceholder,
  TemplateConnector,
} from "@devexpress/dx-react-core";
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";
import saveAs from "file-saver";

const ExportExcel = ({ rowsToExport, columns }) => {
  const exporterRef = useRef(null);
  const startExport = useCallback(() => {
    exporterRef.current.exportGrid();
  }, [exporterRef]);

  const exportMessages = {
    exportAll: "Exportar todo",
  };

  const onSave = (workbook) => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        "Servicios.xlsx"
      );
    });
  };

  return (
    <>
      <GridExporter
        ref={exporterRef}
        rows={rowsToExport}
        columns={columns}
        onSave={onSave}
      />
      <ExportPanel
        messages={exportMessages}
        startExport={() => startExport()}
      />
    </>
  );
};

export default ExportExcel;
