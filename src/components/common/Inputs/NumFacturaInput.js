import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

const NumFacturaInput = ({ setNumFacturaSelected }) => {
  const onChangeFactura = (e) => {
    console.log(e.target.value);
    setNumFacturaSelected(e.target.value);
  };

  return (
    <Col sm={6} className="px-2">
      <FormGroup>
        <Label>Nº factura</Label>
        <Input
          type="text"
          name="numFactura"
          id="numFactura"
          onChange={onChangeFactura}
          required
        />
      </FormGroup>
    </Col>
  );
};

export default NumFacturaInput;
