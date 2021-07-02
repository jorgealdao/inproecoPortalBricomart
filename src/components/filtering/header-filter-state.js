import React from "react";
import { Plugin, Action, Getter } from "@devexpress/dx-react-core";

export class HeaderFilterState extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      filters: props.defaultFilters || []
    };

    this.setColumnFilter = this.setColumnFilter.bind(this);
  }

  filterExpressionComputed({ filterExpression, headerFilterValues }) {
    const newFilterExpression = {
      ...(filterExpression || { filters: [], operator: "and" })
    };

    newFilterExpression.filters = [
      ...newFilterExpression.filters,
      ...headerFilterValues
    ];
    return newFilterExpression;
  }

  setColumnFilter(columnFilter) {
    const { filters } = this.state;
    const { columnName, value } = columnFilter;
    let newValues = filters.filter(
      ({ columnName: colName }) => colName !== columnName
    );
    if (value) {
      newValues = [...newValues, columnFilter];
    }

    this.setState({
      filters: newValues
    });
  }

  render() {
    const { filters } = this.state;

    return (
      <Plugin name="HeaderFilterState">
        <Getter name="headerFilterValues" value={filters} />
        <Getter
          name="filterExpression"
          computed={this.filterExpressionComputed}
        />
        <Action name="setHeaderFilter" action={this.setColumnFilter} />
      </Plugin>
    );
  }
}
