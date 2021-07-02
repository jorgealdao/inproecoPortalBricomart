import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";
import moment from "moment";

const FechaInput = ({ setFechaSelected, setFechaEmisionFactura }) => {
  const onChangeDate = (e) => {
    const dateFormatted = moment(e.target.value).format("DD/MM/YYYY");
    console.log(dateFormatted);
    setFechaSelected(dateFormatted);

    let parts = dateFormatted.split("/");
    console.log(parts);

    let fechaEmision = `${parts[2]}${parts[1]}${parts[0]}`;
    //console.log(fechaEmision);
    setFechaEmisionFactura(fechaEmision);
  };

  return (
    <Col sm={6} className="px-2">
      <FormGroup>
        <Label>Fecha de emisión</Label>
        <Input
          type="date"
          name="fecha"
          id="fecha"
          onChange={onChangeDate}
          required
        />
      </FormGroup>
    </Col>
  );
};

export default FechaInput;
