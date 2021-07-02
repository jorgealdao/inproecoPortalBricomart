import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

const ConceptoFactura = ({ setConceptoFacturaSelected }) => {
  const onChangeConcepto = (e) => {
    console.log(e.target.value);
    setConceptoFacturaSelected(e.target.value);
  };

  return (
    <Col sm={6} className="px-2">
      <FormGroup>
        <Label>Concepto</Label>
        <Input
          type="text"
          name="concepto"
          id="concepto"
          onChange={onChangeConcepto}
          required
        />
      </FormGroup>
    </Col>
  );
};

export default ConceptoFactura;
