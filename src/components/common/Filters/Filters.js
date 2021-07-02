import React, { useState } from "react";

const Filters = () => {
  const [filtersApplied, setFiltersApplied] = useState([]);

  
  return (
    <>
      <FilteringState
        filters={filtersApplied}
        onFiltersChange={(filter) => setFiltersApplied(filter)}
      />
      <SortingState />
      <IntegratedSorting columnExtensions={integratedSortingColumnExtensions} />
    </>
  );
};

export default Filters;
