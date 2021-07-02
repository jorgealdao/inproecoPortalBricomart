import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

const BaseImponibleTotalInput = ({ setBaseImponibleTotalSelected }) => {
  const onChangeBaseImponible = (e) => {
    setBaseImponibleTotalSelected(parseFloat(e.target.value).toFixed(2));
  };

  return (
    <Col sm={4} className="px-2">
      <FormGroup>
        <Label>Base Imponible Total</Label>
        <Input
          type="number"
          name="baseInponible"
          id="baseInponible"
          onChange={onChangeBaseImponible}
        />
      </FormGroup>
    </Col>
  );
};

export default BaseImponibleTotalInput;
