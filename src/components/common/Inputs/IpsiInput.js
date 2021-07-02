import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";

const IpsiInput = ({ setIpsi }) => {
  const onChangeIpsi = (e) => {
    if (e.target.value === "") setIpsi("");
    else setIpsi(parseFloat(e.target.value).toFixed(2));
  };

  return (
    <Col sm={3} className="px-2">
      <FormGroup>
        <Label>IPSI</Label>
        <Input type="number" name="ipsi" id="ipsi" onChange={onChangeIpsi} />
      </FormGroup>
    </Col>
  );
};

export default IpsiInput;
