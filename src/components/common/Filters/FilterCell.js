import React, { useState, useEffect, useCallback } from "react";
import * as PropTypes from "prop-types";

import { TableFilterRow } from "@devexpress/dx-react-grid-bootstrap4";
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";

import { client, getCentros } from "../../../components/graphql";

// components
import UnitsFilterCell from "./UnitsFiltersCell";

const FilterCell = (props) => {
  const { column, centros } = props;
  //const [centros, setCentros] = useState([]);

  /* const fetchCentros = useCallback(async () => {
    let results = [];
    await client
      .query({
        query: getCentros,
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        console.log(res.data.getCentroProductor);
        for (let centro of res.data.getCentroProductor) {
          results.push(centro.DENOMINACION);
        }
      });
    setCentros(results);
  }, [client, getCentros]);

  useEffect(() => {
    fetchCentros();
  }, []); */

  switch (column.name) {
    case "centro":
      return <UnitsFilterCell centros={centros} {...props} />;
    case "estado":
      return <UnitsFilterCell /* options={clientessel} */ {...props} />;
    default:
      return <TableFilterRow.Cell {...props} />;
  }
};

FilterCell.propTypes = {
  column: PropTypes.shape({ name: PropTypes.string }).isRequired,
};

export default FilterCell;
