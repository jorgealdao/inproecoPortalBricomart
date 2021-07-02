import React, { useState } from "react";
import DateRangeFilter from "../Modals/DateRangeFilterModal";
import AddFactura from "../Modals/AddFacturaModal";

const Buttons = ({
  setRows,
  rowsStore,
  tableTitle,
  setShowServiciosAsociarFactura,
  setFacturaId,
  setDocumentoId,
  setFechaEmisionFactura,
  setTotalBaseImponible,
}) => {
  const [datesModal, setDatesModal] = useState(false);
  const [addFacturaModal, setAddFacturaModal] = useState(false);

  const toggleDatesModal = () => {
    setDatesModal(!datesModal);
  };

  const toggleAddFacturaModal = () => {
    setAddFacturaModal(!addFacturaModal);
  };

  const clearFilters = () => {
    setRows(rowsStore);
  };

  return (
    <>
      <div className="botones-footer">
        {tableTitle === "Facturación" ? (
          <button
            className="botones-footer__button"
            onClick={toggleAddFacturaModal}
          >
            Añadir factura
          </button>
        ) : (
          <button className="botones-footer__button" onClick={toggleDatesModal}>
            Búsqueda por fechas
          </button>
        )}
        <button className="botones-footer__button" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>
      {/* Carga del modal para el filtro de fechas */}
      <DateRangeFilter
        datesModal={datesModal}
        toggle={toggleDatesModal}
        setDatesModal={setDatesModal}
        setRows={setRows}
      />
      {/* Carga del modal para añadir factura */}
      <AddFactura
        addFacturaModal={addFacturaModal}
        toggle={toggleAddFacturaModal}
        setShowServiciosAsociarFactura={setShowServiciosAsociarFactura}
        setFacturaId={setFacturaId}
        setDocumentoId={setDocumentoId}
        setFechaEmisionFactura={setFechaEmisionFactura}
        setTotalBaseImponible={setTotalBaseImponible}
      />
    </>
  );
};

export default Buttons;
