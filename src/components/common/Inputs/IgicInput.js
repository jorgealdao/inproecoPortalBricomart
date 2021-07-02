import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

const IgicInput = ({ setIgic }) => {
  const onChangeIgic = (e) => {
    console.log(e.target.value);
    if (e.target.value === "") setIgic("");
    else setIgic(parseFloat(e.target.value).toFixed(2));
  };

  return (
    <Col sm={3} className="px-2">
      <FormGroup>
        <Label>IGIC</Label>
        <Input type="number" name="igic" id="igic" onChange={onChangeIgic} />
      </FormGroup>
    </Col>
  );
};

export default IgicInput;
