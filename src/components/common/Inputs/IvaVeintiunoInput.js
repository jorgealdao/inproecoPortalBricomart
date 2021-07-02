import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

const IvaVeintiunoInput = ({ setIvaVeintiuno }) => {
  const onChangeIva = (e) => {
    if (e.target.value === "") setIvaVeintiuno("");
    else setIvaVeintiuno(parseFloat(e.target.value).toFixed(2));
  };

  return (
    <Col sm={3} className="px-2">
      <FormGroup>
        <Label>IVA 21%</Label>
        <Input
          type="number"
          name="ivaVeintiuno"
          id="ivaVeintiuno"
          onChange={onChangeIva}
        />
      </FormGroup>
    </Col>
  );
};

export default IvaVeintiunoInput;
