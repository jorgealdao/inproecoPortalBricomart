import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

const IvaCeroInput = ({ setIvaCero, setInvalidForm }) => {
  const onChangeIva = (e) => {
    if (e.target.value === "") {
      setIvaCero("");
      setInvalidForm(true);
    } else {
      setIvaCero(parseFloat(e.target.value).toFixed(2));
      setInvalidForm(false);
    }
  };

  return (
    <Col sm={4} className="px-2">
      <FormGroup>
        <Label>IVA 0%</Label>
        <Input
          type="number"
          name="ivaCero"
          id="ivaCero"
          onChange={onChangeIva}
        />
      </FormGroup>
    </Col>
  );
};

export default IvaCeroInput;
