import React, { useState, useEffect, useCallback } from "react";
import * as PropTypes from "prop-types";

import { TableFilterRow } from "@devexpress/dx-react-grid-bootstrap4";
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";

// components
import UnitsFilterCell from "./UnitsFiltersCell";

const FilterCell = (props) => {
  const { column, centros, estados } = props;

  switch (column.name) {
    case "centro":
      return <UnitsFilterCell centros={centros} {...props} />;
    case "estado":
      return <UnitsFilterCell estados={estados} {...props} />;
    default:
      return <TableFilterRow.Cell {...props} />;
  }
};

FilterCell.propTypes = {
  column: PropTypes.shape({ name: PropTypes.string }).isRequired,
};

export default FilterCell;
