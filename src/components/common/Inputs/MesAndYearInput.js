import React from "react";
import { Col, FormGroup, Label, Input } from "reactstrap";
import { setMonth } from "../../constants";

const MesInput = ({ setMesSelected, setYearSelected }) => {
  const onInputChange = (e) => {
    let splittedDate = e.target.value.split("-");
    setMesSelected(setMonth(splittedDate[1]));
    setYearSelected(splittedDate[0]);
  };

  return (
    <Col sm={6} className="px-2">
      <FormGroup>
        <Label>Mes/Año</Label>
        <Input
          type="month"
          name="mesYear"
          id="mesYear"
          onChange={onInputChange}
          required
        />
      </FormGroup>
    </Col>
  );
};

export default MesInput;
