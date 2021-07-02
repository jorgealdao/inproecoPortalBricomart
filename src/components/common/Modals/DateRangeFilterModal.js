import React, { useState, useMemo } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { client, getRetiradasByFechaRealizacion } from "../../graphql";
var DatePickerRangoFechas = require("reactstrap-date-picker");

const DateRangeFilter = ({
  datesModal,
  setDatesModal,
  toggle,
  rows,
  setRows,
}) => {
  // const { user } = useContext(AuthContext);
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")));
  const { gestorId } = user;
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [formattedStartDate, setFormattedStartDate] = useState();
  const [formattedEndDate, setFormattedEndDate] = useState();

  const getQueryString = () => {
    const gestor = { GESTOR_ID: gestorId };
    let queryString = { ...gestor };
    return queryString;
  };

  const handleOnStartChange = (val) => {
    const parts = val.split("T");
    const date = parts[0].replace(/-/g, "");
    setFormattedStartDate(date);
    setStartDate(val);
  };

  const handleOnEndChange = (val) => {
    const parts = val.split("T");
    const date = parts[0].replace(/-/g, "");
    setFormattedEndDate(date);
    setEndDate(val);
  };

  const filterDate = () => {
    let filter = getQueryString();
    filter.FECHA_REALIZACION_ORDEN = `${formattedStartDate}..${formattedEndDate}`;
    let roleAndDatesFilter = JSON.stringify({ ...filter });

    client
      .query({
        query: getRetiradasByFechaRealizacion,
        fetchPolicy: "no-cache",
        variables: {
          limit: 500,
          fields: JSON.parse(roleAndDatesFilter),
        },
      })
      .then((res) => {
        setRows(res.data.getRetiradasView);
        setDatesModal(!datesModal);
      });
  };

  return (
    <Modal isOpen={datesModal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Filtro por fecha</ModalHeader>
      <ModalBody>
        <div>Fecha de Inicio</div>
        <DatePickerRangoFechas
          value={startDate}
          onChange={handleOnStartChange}
        />
        <div>Fecha final</div>
        <DatePickerRangoFechas value={endDate} onChange={handleOnEndChange} />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={filterDate}>
          Buscar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DateRangeFilter;
