import React, { useState, useEffect } from "react";
import * as PropTypes from "prop-types";

import { TableFilterRow } from "@devexpress/dx-react-grid-bootstrap4";
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";

import {
  client,
  GET_DESPLEGABLES,
  GET_FACTURAS,
} from "../../../components/graphql";

// components
import UnitsFilterCell from "./UnitsFiltersCell";

const FilterCell = (props) => {
  const [clientessel, setClientessel] = useState([]);
  const [centrossel, setCentrossel] = useState([]);
  const [zonassel, setZonassel] = useState([]);
  const { column, clientes, zonas, centros } = props;

  useEffect(() => {
    setClientessel({ clientes: clientes, zonas: zonas, centros: centros });
    setZonassel(zonas);
    setCentrossel(centros);
  }, []);
  switch (column.name) {
    case "CLIENTE":
      return <UnitsFilterCell options={clientessel} {...props} />;
    case "ZONA":
      return <UnitsFilterCell options={clientessel} {...props} />;
    case "CENTRO":
      return <UnitsFilterCell options={clientessel} {...props} />;
    case "RESIDUO":
      return <UnitsFilterCell options={centrossel} {...props} />;
    case "ESTADO":
      return <UnitsFilterCell {...props} />;
    case "GESTOR":
    case "TRANSPORTISTA":
      return (
        <UnitsFilterCell
          /* options={zonassel}
          setZonassel={setZonassel} */
          {...props}
        />
      );
    default:
      return <TableFilterRow.Cell {...props} />;
  }
};

FilterCell.propTypes = {
  column: PropTypes.shape({ name: PropTypes.string }).isRequired,
};

export default FilterCell;
