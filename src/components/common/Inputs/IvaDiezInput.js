import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

const IvaDiezInput = ({ setIvaDiez }) => {
  const onChangeIva = (e) => {
    if (e.target.value === "") setIvaDiez("");
    else setIvaDiez(parseFloat(e.target.value).toFixed(2));
  };

  return (
    <Col sm={3} className="px-2">
      <FormGroup>
        <Label>IVA 10%</Label>
        <Input
          type="number"
          name="ivaDiez"
          id="ivaDiez"
          onChange={onChangeIva}
        />
      </FormGroup>
    </Col>
  );
};

export default IvaDiezInput;
