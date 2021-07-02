import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

const TotalConIvaInput = ({ setTotalFacturaIva }) => {
  const onChangeTotal = (e) => {
    setTotalFacturaIva(parseFloat(e.target.value).toFixed(2));
  };
  return (
    <Col sm={4} className="px-2">
      <FormGroup>
        <Label>Total Factura con IVA</Label>
        <Input
          type="number"
          name="totalIva"
          id="totalIva"
          onChange={onChangeTotal}
        />
      </FormGroup>
    </Col>
  );
};

export default TotalConIvaInput;
