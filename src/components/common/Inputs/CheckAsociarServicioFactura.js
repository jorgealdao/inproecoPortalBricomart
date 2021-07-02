import React, { useState, useEffect } from "react";

// Variable global para ir modificando el state
let lista = [];

const CheckAsociarServicioFactura = ({ row, setCheckedRows, checkedRows }) => {
  //const [checkedRows, setCheckedRows] = useState([]);

  const onCheck = (e) => {
    console.log(e.target.checked);
    if (e.target.checked) {
      lista.push(row.ID);
      setCheckedRows(lista);
    } else {
      const index = lista.indexOf(row.ID);
      if (index > -1) {
        lista.splice(index, 1);
      }
      setCheckedRows(lista);
    }
    console.log(lista);
    console.log(checkedRows);
  };

  return <input type="checkbox" onClick={onCheck} />;
};

export default CheckAsociarServicioFactura;
