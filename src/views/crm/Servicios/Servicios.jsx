import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import * as PropTypes from 'prop-types';
import moment from 'moment';
import Dropzone from 'react-dropzone'
import saveAs from 'file-saver';
import MultiSelect from "@khanacademy/react-multi-select";
import DatePicker from "react-multi-date-picker"
import "react-multi-date-picker/styles/colors/green.css"

import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import DayPicker from 'react-day-picker';
import MomentLocaleUtils from 'react-day-picker/moment';
import 'moment/locale/es';

import {
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Container, Row, Col, Label, FormGroup, Input, Form, FormText
} from 'reactstrap';
import { GridExporter } from '@devexpress/dx-react-grid-export';
import { SearchState } from '@devexpress/dx-react-grid';
import { SearchPanel } from '@devexpress/dx-react-grid-bootstrap4';

import {
    PluginHost, Plugin, Getter, Action, Template, TemplatePlaceholder, TemplateConnector,
  } from '@devexpress/dx-react-core';

import { client, getRetiradas, getRetiradasByFechaRealizacion, getRetiradasFilter, getRetiradaMainFilterId, getRetiradaMainFilterCliente, getRetiradasMainFilter, GET_CENTROS_BY_NOMBRE_ZONA, GET_DESPLEGABLES, GET_RESIDUOS_CENTRO, GET_CENTROS_ZONA, GET_TIPO_DOCUMENTOS, GET_FACTURAS, GET_FACTURA_RETIRADA, GET_FACTURAS_BY_NUMERO, GET_GESTORES_RESIDUO, GET_TRANSPORTISTAS_RESIDUO, GET_PENDIENTES, GET_LER_BY_RESIDUO } from "../../../components/graphql";
import { DetailContent, DetailEditCell, DetailCell } from "./DetailContentLM";
import { GET_RESULTS_SERVICIOS, ESTADOS_BORRABLES, API_INPRONET } from "../../../components/constants";

import classNames from 'clsx';

import {
    FilteringState,
    IntegratedFiltering,
    EditingState,
    RowDetailState,
    IntegratedSorting,
    SortingState, 
    DataTypeProvider
} from '@devexpress/dx-react-grid';
import {
    Grid,
    TableHeaderRow,
    TableFilterRow,
    TableRowDetail,
    VirtualTable,
    TableColumnVisibility,
    Toolbar,
    ExportPanel,
    TableEditColumn
} from '@devexpress/dx-react-grid-bootstrap4';
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';
import { Filter } from '@material-ui/icons';
import { DateRange } from 'moment-range';
import { convertCompilerOptionsFromJson } from 'typescript';
//import DateRangePicker from 'react-daterange-picker';
var DatePickerRangoFechas = require("reactstrap-date-picker");

// const { RangePicker } = DatePicker;

const getRowId = row => row.id;

// Estilos para los servicios marcados como pendientes y filas editable
const styles = {
    pendiente: {
      backgroundColor: '#a2e2a4',
    },
    pendienteObservaciones: {
        backgroundColor : '#F08F65'
    },
    peligrosoSinFecha: {
        backgroundColor : '#31C9E7'
    },
    onEdit: {
        backgroundColor: '#C6C6C5'
    }
};
// Mensajes por defecto de los campos
const filterRowMessages = {
    filterPlaceholder: 'Filtrar...',
};

// Inicializamos colecciones
let transportistas = [];
let gestores = [];
let clientes = [];
let zonas = [];
let centros = [];
let residuos = [];
let estados = [];
let facturas = [];


// Recogemos y ordenamos los datos para los dropdowns
client.query({
    query: GET_DESPLEGABLES,
  }).then((res) => {
    transportistas = res.data.getTransportistasView;
    transportistas.sort((a, b) => a.nombre.localeCompare(b.nombre))
    gestores = res.data.getGestor;
    gestores.sort((a, b) => a.nombre.localeCompare(b.nombre))
    clientes = res.data.getClientesView;
    clientes = clientes.filter(cliente => cliente.nombre !== "LEROY MERLIN INSTALACIONES" && cliente.nombre !== "LEROY MERLIN MATERIALES")
    clientes.sort((a, b) => a.nombre.localeCompare(b.nombre))
    residuos = res.data.getResiduosView;
    residuos.sort((a, b) => a.nombre.localeCompare(b.nombre))
    zonas = res.data.getZona;
    zonas = zonas.filter(zona => zona.nombre !== "")
    zonas.sort((a, b) => a.nombre.localeCompare(b.nombre))
    centros = res.data.getCentrosProductoresView;
    centros.sort((a, b) => a.nombre.localeCompare(b.nombre))
    estados = res.data.getEstadoRetirada;
    estados.sort((a, b) => a.nombre.localeCompare(b.nombre))
})

// Recoger las facturas para poder comparar las facturas asociadas de los servicios
client.query({
    query: GET_FACTURAS
}).then((res) => {
    facturas = res.data.getFacturasView
})

// Creación de un contexto para compartir estados
const Context = React.createContext({ value: null, setValue: () => {}, rows: {}, setRows:() => {}, lastQuery: {}, oldEstado: {}, setOldEstado: ()=> {}, newEstado: {}, setNewEstado: ()=> {}, changedId: {}, setChangedId: ()=> {}});

// Celda con icono de apertura y cierre de fila para editar AÑADIDO ICONO DE BORRAR CON SU MODAL
const ToggleCell = ({
    expanded, onToggle,
    tableColumn, tableRow, row, style,
    ...restProps
}) => {
    const [deleteModal, setDeleteModal] = useState(false)
    const {rows} = useContext(Context);
    const {setRows} = useContext(Context);
    const {lastQuery} = useContext(Context);
    const {setOldEstado} = useContext(Context);
    const {newEstado} = useContext(Context);
    const {setNewEstado} = useContext(Context);
    const {changedId} = useContext(Context);
    const {setChangedId} = useContext(Context);

    const handleClick = (e) => {
        e.preventDefault();
        onToggle();

        setOldEstado(row.ESTADO)
        let elementTr = e.target.parentElement.parentElement;

        if(!expanded){
            elementTr.style.backgroundColor = styles.onEdit.backgroundColor
            row.onEdit = true
        } else {
            elementTr.style.backgroundColor = null
            row['PENDIENTE_REVISAR_OBSERVACIONES'] = false;
            row.onEdit = false;

            //LAS FILAS PENDIENTES DE REVISAR SOLO SE QUEDAN EN BLANCO SI HAY UN CAMBIO DE ESTADO
            if(changedId == row.id && newEstado) {
                row['PENDIENTE_REVISAR'] = false;
                setNewEstado(false)
                setOldEstado(null)
                setChangedId(null)
            } 

        }
    };

    const allowDelete = () => {
        const allowed = ESTADOS_BORRABLES.filter(estado => row.ESTADO.includes(estado))
        if(allowed.length > 0) return true
        else return false
    }

    const toggleDeleteModal = (e) => {
        e.preventDefault();
        setDeleteModal(!deleteModal)
    };

    const deleteServicio = (e) => {
        e.preventDefault();
        var data = new FormData();

        data.append('accion', "borrarRetirada" );
        data.append('retiradaId', row.id );

        const requestOptions = {
            method: 'POST',
            body: data
        };
        
        fetch(`${API_INPRONET}/core/controller/RetiradaController.php`, requestOptions)
        .then(response => response.text())
        .then(data => {
            //console.log(data)
        });  

        const changedRows = rows.filter(fila => fila.id !== row.id)
        setRows(changedRows)
        setDeleteModal(!deleteModal)     
    }

    const DeleteConfirmation = ({isOpen, toggle}) => {
        if(allowDelete()){
            return(
                <Modal isOpen={isOpen} toggle={toggle}>
                    <ModalHeader toggle={toggle}>Confirmación de borrado</ModalHeader>
                    <ModalBody>
                        ¿Seguro que desea eliminar el registro?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={()=>setDeleteModal(!deleteModal)}>
                            Cancelar
                        </Button>
                        {' '}
                        <Button color="primary" type="submit" onClick={deleteServicio}>
                            Borrar
                        </Button>
                    </ModalFooter>
                </Modal>
            )
        } else {
            return (
                <Modal isOpen={isOpen} toggle={toggle}>
                    <ModalHeader toggle={toggle}>Confirmación de borrado</ModalHeader>
                    <ModalBody>
                        El estado de este servicio no permite su borrado
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={()=>setDeleteModal(!deleteModal)}>
                            Cancelar
                        </Button>
                    </ModalFooter>
                </Modal>
            )
        }     
    }

    return (
        <td
            style={{
                cursor: 'pointer',
                verticalAlign: 'middle',
                textAlign: 'center',
                ...style,
            }}
            {...restProps}
        >
            <i
                role="button"
                tabIndex={0}
                aria-label={expanded ? 'Close' : 'Edit'}
                className={classNames({
                    oi: true,
                    'oi-x': expanded,
                    'oi-pencil': !expanded,
                })}
                onClick={handleClick}
            />
            <i className="oi oi-trash" onClick={toggleDeleteModal}/>
            <DeleteConfirmation isOpen={deleteModal} toggle={toggleDeleteModal}/>
        </td>
    );
};
// Descarga de XLS Excel
const onSave = (workbook) => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Servicios.xlsx');
    });
};

//Variable global para las opciones de los checkbox seleccionadas
let clickedOption = []
let clickedOptionCentro = []
let clickedOptionZona = []
let clickedOptionResiduo = []
let centrosCliente = []
let clickedPendiente = {}
// Código para rellenar los dropdowns dinámicamente
const UnitsFilterCell = ({ filter, onFilter, column, options, setZonassel }) => {
    //const [selected, setSelected] = useState([]);
    const {setValue} = useContext(Context);
    const {value} = useContext(Context);

    let elems = []
    let col = []
    let data = []
    //Dropdowns normales
    if (column.name === "CLIENTE") elems = options.clientes ? options.clientes:[];
    if (column.name === "TRANSPORTISTA") elems = transportistas;
    if (column.name === "GESTOR") elems = gestores;
    if (column.name === "ESTADO") elems = estados;
    
    //Dropdowns dinámicos
    if (column.name === "ZONA") {
        //console.log(value)
        if(value && value.zonas ) {
            data = value.zonas;
        } else {
            elems=zonas
            data = elems.map(elem => { return {label: elem.nombre, value: elem.nombre}})
        }
        return (
            <th style={{ fontWeight: 'normal' }}>
                <MultiSelect
                    selectAllLabel="Todos"
                    selectSomeItems="Seleccionar..."
                    options={data}
                    selected={clickedOptionZona}
                    overrideStrings={{"selectSomeItems": "Seleccionar...", "search":"Buscar", "allItemsAreSelected":"Todos"}}
                    onSelectedChanged={selected =>{
        
                        if(column.name === "ZONA"){
                            if(centrosCliente.length !== 0){
                                let activeCentros = centrosCliente.filter((centro) => (selected.includes(centro.zona)) )
                                if(activeCentros.length !== 0){
                                    let filteredCentros = activeCentros.map(centro => { return {label: centro.nombre, value: centro.nombre}})                         
                                    setValue({...value, centros: filteredCentros});
                                } /* else {
                                    console.log('fuera activeCentros')
                                    let allCentrosCliente = centrosCliente.map(centro => { return {label: centro.nombre, value: centro.nombre}})
                                    setValue({...value, centros: allCentrosCliente});
                                } */
                            } else {
                                //console.log('fuera de centrosCliente')
                                let activeCentros = centros.filter((centro) => (selected.includes(centro.zona)) )
                                console.log("activeCentros", activeCentros)
                                if(activeCentros.length !== 0){
                                    let filteredCentros = activeCentros.map(centro => { return {label: centro.nombre, value: centro.nombre}})                          
                                    setValue({...value, centros: filteredCentros});
                                }
                            }                  
                            //console.log(activeCentros)
                        }

                        // Actualizamos el valor seleccionado              
                        clickedOptionZona = selected

                        onFilter(selected ? { value: selected } : null)
                    }}
                />
        
            </th>
        )
    } else if (column.name === "CENTRO") {
        if(value && value.centros ) {
            data = value.centros;
        } else {
            elems=centros
            data = elems.map(elem => { return {label: elem.nombre, value: elem.nombre}})
        }
        return (
            <th style={{ fontWeight: 'normal' }}>
                <MultiSelect
                    selectAllLabel="Todos"
                    selectSomeItems="Seleccionar..."
                    options={data}
                    selected={clickedOptionCentro}
                    overrideStrings={{"selectSomeItems": "Seleccionar...", "search":"Buscar", "allItemsAreSelected":"Todos"}}
                    onSelectedChanged={selected =>{
                        console.log("selected", selected)

                            //Se marcan todos los RESIDUOS como opciones
                            let residuos_select = residuos.map(residuo => { return {label: residuo.nombre, value: residuo.nombre}})
                            setValue({...value, residuos: residuos_select});
        
                            //Si se ha seleccionado un CENTRO, saca sus RESIDUOS
                            if(selected && selected.length > 0){
                                
                                let activeCentro = centros.filter((centro) => {return selected.includes(centro.nombre)})
                                console.log("active", activeCentro) 
                                if(activeCentro.length>0) {                
                                client.query({
                                    query: GET_RESIDUOS_CENTRO,
                                    variables: {
                                        id: activeCentro[0].id.toString()
                                    }
                                }).then((res) => {
                                    let filteredResiduos = res.data.getCentroProductorResiduo;
                                    filteredResiduos.sort((a, b) => a.residuo[0].nombre.localeCompare(b.residuo[0].nombre))
                                    let residuos_select = filteredResiduos.map(residuo => { return {label: residuo.residuo[0].nombre, value: residuo.residuo[0].nombre}})
                                    setValue({...value, residuos: residuos_select});
                                })}
                            }
                        
                        // Actualizamos el valor seleccionado              
                        clickedOptionCentro = selected
                        //setSelected(selected)          
                        // Callback a filtrado
                        onFilter(selected ? { value: selected } : null)
                    }}
                />
        
            </th>
        )
    } else if (column.name === "RESIDUO") {
        if(value && value.residuos ) {
            data = value.residuos;
        } else {
            elems = residuos
            data = elems.map(elem => { return {label: elem.nombre, value: elem.nombre}})
        }
        return (
            <th style={{ fontWeight: 'normal' }}>
                <MultiSelect
                    selectAllLabel="Todos"
                    selectSomeItems="Seleccionar..."
                    options={data}
                    selected={clickedOptionResiduo}
                    overrideStrings={{"selectSomeItems": "Seleccionar...", "search":"Buscar", "allItemsAreSelected":"Todos"}}
                    onSelectedChanged={selected =>{
                       
                        // Actualizamos el valor seleccionado              
                        clickedOptionResiduo = selected
                        //setSelected(selected)          
                        // Callback a filtrado
                        onFilter(selected ? { value: selected } : null)
                    }}
                />
        
            </th>
        )   
    } else {
        // mapeamos con label y value
        data = elems.map(elem => { return {label: elem.nombre, value: elem.nombre}})
    }

    return (
    <th style={{ fontWeight: 'normal' }}>
        <MultiSelect
            selectAllLabel="Todos"
            selectSomeItems="Seleccionar..."
            options={data}
            selected={clickedOption}
            overrideStrings={{"selectSomeItems": "Seleccionar...", "search":"Buscar", "allItemsAreSelected":"Todos"}}
            onSelectedChanged={selected =>{
                console.log("selected", selected)
                // Activamos los cambios a partir de la columna CLIENTE
                if(column.name === "CLIENTE") {
                    //console.log(centrosCliente)
                    let activeZonas = zonas.filter((zona) => (selected.includes(zona.cliente[0].nombre)))
                    let zonas_select = activeZonas.map(zona => { return {label: zona.nombre, value: zona.nombre}})
                    setValue({zonas: zonas_select, centros: value?value.centros:[]});

                    //Actualizamos los centros
                    let activeCentros = centros.filter((centro) => (selected.includes(centro.cliente)) )
                    let centros_select = activeCentros.map(centro => { return {label: centro.nombre, value: centro.nombre}})
                    centrosCliente = activeCentros
                    setValue({zonas: zonas_select ? zonas_select:[], centros: centros_select});

                }

                if(column.name === "ZONA"){
                    if(centrosCliente.length !== 0){
                        let activeCentros = centrosCliente.filter((centro) => (selected.includes(centro.zona)) )
                        if(activeCentros.length !== 0){
                            let filteredCentros = activeCentros.map(centro => { return {label: centro.nombre, value: centro.nombre}})                         
                            setValue({...value, centros: filteredCentros});
                        } /* else {
                            console.log('fuera activeCentros')
                            let allCentrosCliente = centrosCliente.map(centro => { return {label: centro.nombre, value: centro.nombre}})
                            setValue({...value, centros: allCentrosCliente});
                        } */
                    } else {
                        //console.log('fuera de centrosCliente')
                        let activeCentros = centros.filter((centro) => (selected.includes(centro.zona)) )
                        console.log("activeCentros", activeCentros)
                        if(activeCentros.length !== 0){
                            let filteredCentros = activeCentros.map(centro => { return {label: centro.nombre, value: centro.nombre}})                          
                            setValue({...value, centros: filteredCentros});
                        }
                    }                  
                    //console.log(activeCentros)
                }

                if(column.name === "CENTRO"){
                    //Se marcan todos los RESIDUOS como opciones
                    let residuos_select = residuos.map(residuo => { return {label: residuo.nombre, value: residuo.nombre}})
                    setValue({...value, residuos: residuos_select});

                    //Si se ha seleccionado un CENTRO, saca sus RESIDUOS
                    if(selected && selected.length > 0){
                        
                        let activeCentro = centros.filter((centro) => {return selected.includes(centro.nombre)})
                        console.log("active", activeCentro) 
                        if(activeCentro.length>0) {                
                        client.query({
                            query: GET_RESIDUOS_CENTRO,
                            variables: {
                                id: activeCentro[0].id.toString()
                            }
                        }).then((res) => {
                            let filteredResiduos = res.data.getCentroProductorResiduo;
                            filteredResiduos.sort((a, b) => a.residuo[0].nombre.localeCompare(b.residuo[0].nombre))
                            let residuos_select = filteredResiduos.map(residuo => { return {label: residuo.residuo[0].nombre, value: residuo.residuo[0].nombre}})
                            setValue({...value, residuos: residuos_select});
                        })}
                    }
                }
                // Actualizamos el valor seleccionado              
                clickedOption = selected
                //setSelected(selected)          
                // Callback a filtrado
                onFilter(selected ? { value: selected } : null)
            }}
        />

    </th>
)};

UnitsFilterCell.propTypes = {
    filter: PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
    }),
    onFilter: PropTypes.func.isRequired,
    column: PropTypes.shape({ name: PropTypes.string }).isRequired,
};

UnitsFilterCell.defaultProps = {
    //column: column,
    filter: null,
};
// Selección de componentes según el tipo dropdown o input
// TODO: Limpiar zonassel y setzonassel
const FilterCell = (props) => {
    const [clientessel, setClientessel] = useState([]);
    const [centrossel, setCentrossel] = useState([]);

    const [zonassel, setZonassel] = useState([]);
    useEffect(() => {
        setClientessel({clientes: clientes, zonas: zonas, centros: centros})
        setZonassel(zonas)
        setCentrossel(centros)
    }, [])
    const { column } = props;
    if(column.name === 'CLIENTE') return <UnitsFilterCell options={clientessel} {...props} />;
    if(column.name === 'ZONA') return <UnitsFilterCell options={clientessel}  {...props} />;
    if(column.name === 'CENTRO') return <UnitsFilterCell options={clientessel}  {...props} />;
    if(column.name === 'RESIDUO') return <UnitsFilterCell options={centrossel} {...props} />;
    if(column.name === 'ESTADO') return <UnitsFilterCell {...props} />;

    if (column.name === 'TRANSPORTISTA' || column.name === 'GESTOR') {
      return <UnitsFilterCell options={zonassel} setZonassel={setZonassel} {...props} />;
    }

    return <TableFilterRow.Cell {...props} />;
};

FilterCell.propTypes = {
    column: PropTypes.shape({ name: PropTypes.string }).isRequired,
};

// Filtro para multiples selecciones en los dropdowns
const columnFilterMultiPredicate = (value, filter, row) => {
    if (!filter.value.length) return true;
    for(let i = 0; i<filter.value.length; i++){
        if(value === filter.value[i]) return true
    }
    
    return IntegratedFiltering.defaultPredicate(value, filter, row);
}

// Comienza el COMPONENTE principal
export default () => {

    
    //Estador para abrir los modales
    const [datesModal, setDatesModal] = useState(false)
    const [serviciosRealizadosModal, setServiciosRealizadosModal] = useState(false)
    const [addServicioModal, setAddServicioModal] = useState(false)
    const [clickedPendienteRevisar, setClickedPendienteRevisar] = useState(false)
    const [clickedPendienteObservacion, setClickedPendienteObservacion] = useState(false)
    const [clickedPeligrosoSinFecha, setClickedPeligrosoSinFecha] = useState(false)

    // Necesario para el Exportador
    const exporterRef = useRef(null);

    const startExport = useCallback(() => {
        exporterRef.current.exportGrid();
    }, [exporterRef]);

    const exportMessages = {
        exportAll: 'Exportar todo'
    }
    // Checkbox de mostrar servicios pendientes
    const togglePendientes = (key) =>{
        let value = {}
        if(!rowsStore || rowsStore.length === 0) {
            setRowsStore(rows)
            console.log(rows.length)
            if(key === "PENDIENTE_REVISAR_OBSERVACIONES"){
                setClickedPendienteObservacion(!clickedPendienteObservacion)
                value = {"PENDIENTE_REVISAR_OBSERVACIONES": "1"}
            } else if (key === "PENDIENTE_REVISAR"){
                setClickedPendienteRevisar(!clickedPendienteRevisar)
                value = {"PENDIENTE_REVISAR": "1"}
            } else if(key === "PELIGROSO_SIN_FECHA"){
                setClickedPeligrosoSinFecha(!clickedPeligrosoSinFecha)
                value = {"PELIGROSO_SIN_FECHA": "1"}
            }
            console.log(value)
            client.query({
                query: GET_PENDIENTES,
                        fetchPolicy: 'no-cache',
                        variables: {
                            value,
                            limit: 1000
                        }
            }).then((res) => {
                let results = GET_RESULTS_SERVICIOS(res)
                setPendientes(results)
                setRows(results)
            }) 

        }  else {
            if(key === "PENDIENTE_REVISAR_OBSERVACIONES"){
                setClickedPendienteObservacion(!clickedPendienteObservacion)
            } else if (key === "PENDIENTE_REVISAR"){
                setClickedPendienteRevisar(!clickedPendienteRevisar)
            } else if(key === "PELIGROSO_SIN_FECHA"){
                setClickedPeligrosoSinFecha(!clickedPeligrosoSinFecha)
            }
            setRows(rowsStore)
            setRowsStore([])
            setPendientes([])
        }
    }

    //Abrir modal para AÑADIR SERVICIO
    const toggleAddServicioModal = () => {
        setAddServicioModal(!addServicioModal)
    }
    //MODAL PARA AÑADIR SERVICIOS
    const AddServicio = ({isOpen, toggle}) => {

        const [fileNames, setFileNames] = useState([]);
        const [uploadFiles, setUploadFiles] = useState([]);
        const [newFiles, setNewFiles] = useState([]);
        const [tipoDocumentos, setTipoDocumentos] = useState([])

        const [clienteSelected, setClienteSelected] = useState()
        const [zonaSelected, setZonaSelected] = useState()
        const [centroSelected, setCentroSelected] = useState()
        const [residuoSelected, setResiduoSelected] = useState()
        const [zonasModal, setZonasModal] = useState([])
        const [centrosModal, setCentrosModal] = useState([])
        const [residuosModal, setResiduosModal] = useState([])
        const [gestoresModal, setGestoresModal] = useState([])
        const [gestorActive, setGestorActive] = useState([])
        const [gestorSelected, setGestorSelected] = useState()
        const [transportistasModal, setTransportistasModal] = useState([])
        const [transportistaActive, setTransportistaActive] = useState([])
        const [transportistaSelected, setTransportistaSelected] = useState()
        const [fechaSelected, setFechaSelected] = useState()
        const [estadoSelected, setEstadoSelected] = useState()
        const [cantidad, setCantidad] = useState()
        const [facturaSelected, setFacturaSelected] = useState()
        const [invalidFactura, setInvalidFactura] = useState(false)
        const [observaciones, setObservaciones] = useState()
        const [ler, setLer] = useState('')

        useEffect(() => {
            getDocumentos()
        }, [])

        const getZonasByCliente = (e) => {
            //console.log(e.target.value)
            setClienteSelected(e.target.value)
            let activeZonas = zonas.filter((zona) => e.target.value.includes(zona.cliente[0].nombre))
            setZonasModal(activeZonas)
        }

        const getCentrosByZona = (e) => {
            setZonaSelected(e.target.value)
            client.query({
                query: GET_CENTROS_ZONA,
                variables: {
                    id: e.target.value.toString()
                }
            }).then((res) => {
                let filteredCentros = res.data.getCentrosProductoresView;        
                let activeCentros = filteredCentros.sort((a, b) => a.denominacion.localeCompare(b.denominacion))
                setCentrosModal(activeCentros)
            })
        }

        const getResiduosByCentro = (e) => {
            setCentroSelected(e.target.value)
            client.query({
                query: GET_RESIDUOS_CENTRO,
                variables: {
                    id: e.target.value.toString()
                }
            }).then((res) => {
                let filteredResiduos = res.data.getCentroProductorResiduo;        
                let activeResiduos = filteredResiduos.sort((a, b) => a.residuo[0].nombre.localeCompare(b.residuo[0].nombre))
                //activeResiduos.map(act => console.log(act))
                setResiduosModal(activeResiduos)
            })
        }

        const getGestoresAndTransportistasByResiduoCentro = (e) => {
            console.log(e.target.value)
            setResiduoSelected(parseInt(e.target.value))
            //GESTORES
            client.query({
                query: GET_GESTORES_RESIDUO,
                variables: {
                    id: e.target.value.toString()
                }
            }).then((res) => {
                let filteredGestores = res.data.getCentroProductorResiduoGestor;        
                //console.log(filteredGestores)
                let allGestores = filteredGestores.sort((a, b) => a.GESTOR[0].nombre.localeCompare(b.GESTOR[0].nombre))
                setGestorActive(allGestores.filter(gestor => {
                    //console.log(gestor)
                    //setGestorSelected(gestor.GESTOR[0].id)
                    return gestor.activo === 1
                }))
                setGestoresModal(allGestores.filter(gestor => gestor.activo === 0))
            })
            //TRANSPORTISTAS
            client.query({
                query: GET_TRANSPORTISTAS_RESIDUO,
                variables: {
                    id: e.target.value.toString()
                }
            }).then((res) => {
                let filteredTransportistas = res.data.getCentroProductorResiduoTransportista;        
                //console.log(filteredTransportistas)
                let allTransportistas = filteredTransportistas.sort((a, b) => a.TRANSPORTISTA[0].nombre.localeCompare(b.TRANSPORTISTA[0].nombre))
                setTransportistaActive(allTransportistas.filter(transportista => {
                    //setTransportistaSelected(transportista.TRANSPORTISTA[0].id)
                    return transportista.activo === 1
                }))
                setTransportistasModal(allTransportistas.filter(transportista => transportista.activo === 0))
            })
            getLer(e.target.value)
        }

        const getLer = (id) => {
            const residuo = residuosModal.filter(res => res.id === parseInt(id))
            client.query({
                query: GET_LER_BY_RESIDUO,
                variables: {
                    id: residuo[0].residuo[0].id.toString()
                }
            }).then(res => {
                console.log(res.data.getResiduosView[0].LER)
                setLer(res.data.getResiduosView[0].LER)
            })
        }

        const onChangeGestor = (e) => {    
            //console.log(e.target.value)
            setGestorSelected(e.target.value)
        }

        const onChangeTransportista = (e) => {    
            //console.log(e.target.value)
            setTransportistaSelected(e.target.value)
        }

        const onChangeDate = (e) => {    
            const dateFormatted = moment(e.target.value).format('DD/MM/YYYY')
            console.log(dateFormatted)
            setFechaSelected(dateFormatted)
        }

        const onChangeCantidad = (e) => {    
            setCantidad(e.target.value === 'undefined' ? '' : e.target.value)
        }

        const onChangeEstado = (e) => {    
            setEstadoSelected(e.target.value)
        }

        const compareFacturas = () => {
            return facturas.filter(factura => facturaSelected === factura.numFactura)
        }

        const onChangeFactura = async (e) => {
            setFacturaSelected(e.target.value)
            if(e.target.value === ""){
                setInvalidFactura(false)
              } else {
                const facturaQuery = await client.query({
                  query: GET_FACTURAS_BY_NUMERO,
                  fetchPolicy: 'no-cache',
                  variables: {
                    numFactura: e.target.value
                  }
                })
                const response = await facturaQuery;

                if(response.data.getFacturasView.length === 0){
                  setInvalidFactura(true)
                } else {
                  setInvalidFactura(false)
                }
              }
        }

        const onChangeObservaciones = (e) => {    
            setObservaciones(e.target.value)
        }

        const handleSubmit = async (e) => {
            e.preventDefault()
            const loggedUser = JSON.parse(sessionStorage.getItem("user"))
            const data = new FormData()
            data.append('accion', 'guardarRetiradaInproecoCompleta');
            data.append('nickname', loggedUser.name );
            data.append('fechaAlta', moment().format('DD/MM/YYYY'));
            data.append('selectCentroProductorResiduoId', residuoSelected );
            data.append('selectGestorId', !gestorSelected ? gestorActive[0].GESTOR[0].id : gestorSelected );
            data.append('selectTransportistaId', !transportistaSelected ? transportistaActive[0].TRANSPORTISTA[0].id : transportistaSelected);
            data.append('selectUsuarioId', loggedUser['custom:ID'] );
            data.append('solicitanteTexto', '' );
            data.append('fechaRealizacion', fechaSelected ? fechaSelected : '');

            data.append('cantidad', cantidad ? cantidad : '');
            data.append('selectEstadoId', estadoSelected ? estadoSelected : '');

            data.append('observaciones', observaciones ? observaciones : '');
            if(compareFacturas().length > 0) {
                data.append('factura', facturaSelected );
            } else {
                data.append('factura', '');
            }
               
            const requestOptions = {
                method: 'POST',
                body: data
            };

            const saveServicio = await fetch(`${API_INPRONET}/core/controller/RetiradaController.php`, requestOptions)
            const resSaveServicio = await saveServicio.text()

            //QA
            /* fetch('http://34.243.112.211/inproecoweb2_0/core/controller/RetiradaController.php', requestOptions)
                .then(response => response.text())
                .then(data => {
                    //console.log(data)
            }); */

            //UNA VEZ REGISTRADO EL SERVICIO, LO RECUPERAMOS PARA ADJUNTARLE DOCUMENTOS
            const getAllServicios = await client.query({
                    query: getRetiradas,
                    fetchPolicy: 'no-cache',
                    variables: {
                        offset: 0,
                        limit: 1000
                    }
                })
            const res = await getAllServicios
            let results = GET_RESULTS_SERVICIOS(res)          
            setRows(results)
            //SE PASA EL ID DE LA ÚLTIMA RETIRADA GUARDADA Y LOS DATOS DE LOS ARCHIVOS
            saveDocuments(res.data.getRetiradasView[0].id, newFiles, fileNames)
            toggleAddServicioModal()
        }

        const getDocumentos = () => {
            client.query({
                query: GET_TIPO_DOCUMENTOS,
            }).then((res) => {
                //console.log("TIPOS", res.data)
                let tipos = res.data.getTipoDocumento;
                tipos.sort((a, b) => a.nombre.localeCompare(b.nombre))
                setTipoDocumentos(tipos)
          })
        }

        const onDrop = useCallback(acceptedFiles => {
            setNewFiles(newFiles.concat(acceptedFiles))
            let newFileNames = []
            acceptedFiles.forEach((file)=> {
              newFileNames.push({
                "NOMBRE": file.name,
                "RUTA":"","TIPO_DOCUMENTO_ID":"", "IS_NEW": true })
            })
            const files = fileNames.concat(newFileNames)
            setFileNames(files);
            setUploadFiles(acceptedFiles);
          })

          const changeType = (event)=> {
            const selectedFiles = fileNames.map((fileName)=> {
              if(fileName.NOMBRE === event.target.name) {
                fileName.TIPO_DOCUMENTO_ID = event.target.value
              }
              return fileName;
            })
            setFileNames(selectedFiles)
          }

          const saveDocuments = (retiradaId, files=[], fileNames=[]) => {
              //console.log(retiradaId, files, fileNames)
            if(files.length>0 && fileNames.length>0) {
                //console.log(files, fileNames)
              files.forEach((doc) => {

                let fileDataFiltered = []
                // files.map(doc => {
                  //console.log("doc",doc)
                  const filterred = fileNames.filter(file => {
                    //console.log("file",file)

                    return doc.name === file.NOMBRE
                  })
                  //console.log("filterred",filterred)

                  if(filterred.length>0) fileDataFiltered = filterred;
                // })
                //console.log("fileDataFiltered", fileDataFiltered)
                console.log('aqui', doc)
                const docData = new FormData();
                docData.append("accion", "adjuntarDocumentoRetirada")
                docData.append("retiradaId", retiradaId)
                docData.append("tipoId", fileDataFiltered[0].TIPO_DOCUMENTO_ID)
                docData.append('documento', doc)
                                    
                const requestOptions = {
                  method: 'POST',
                  body: docData
                };
                fetch(`${API_INPRONET}/core/controller/RetiradaController.php`, requestOptions)
                .then(response => response.text())
                .then(res => console.log(res));
              })
            }
          }

          const quitarDocumento = (name) => {
            setNewFiles(newFiles.filter(item => item.name !== name.NOMBRE))
            setFileNames(fileNames.filter(item => item !== name));
        }

        return(
            <Modal isOpen={isOpen} toggle={toggle} size="lg">
                <ModalHeader toggle={toggle}>Añadir Servicio</ModalHeader>
                <ModalBody>
                <Container>
                        <Row>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Fecha de alta</Label>
                                    <Input type="text" name="fecha" id="fecha" placeholder={moment().format('DD/MM/YYYY hh:mm')}>                                          
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Cliente</Label>
                                    <Input type="select" name="cliente" id="cliente" onChange={getZonasByCliente}>    
                                        <option disabled selected defaultValue> -- Seleccionar -- </option>
                                        {clientes.map(cliente => {
                                            return <option key={cliente.id} value={cliente.nombre}>{cliente.nombre}</option>
                                        })}                                        
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row> 
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Zona</Label>
                                    <Input type="select" name="zona" id="zona" onChange={getCentrosByZona}>
                                        <option disabled selected value> -- Seleccionar -- </option>
                                        {zonasModal.map(zona => {
                                            return <option value={zona.id}>{zona.nombre}</option>
                                        })}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Centro</Label>
                                    <Input type="select" name="centro" id="centro" onChange={getResiduosByCentro}>
                                    <option disabled selected value> -- Seleccionar -- </option>
                                    {centrosModal.map(centro => {
                                        return <option value={centro.id}>{centro.denominacion}</option>
                                    })}
                                </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>   
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Residuo</Label>
                                    <Input type="select" name="residuo" id="residuo" onChange={getGestoresAndTransportistasByResiduoCentro}>
                                    <option disabled selected value> -- Seleccionar -- </option>
                                    {residuosModal.map((residuo) => {
                                        //console.log(residuo)
                                        return <option value={residuo.id}>{residuo.residuo[0].nombre}</option>
                                    })}
                                </Input>
                                </FormGroup>
                            </Col>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>LER</Label>
                                    <Input name="ler" id="ler" value={ler} readOnly/>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Gestor</Label>
                                    <Input type="select" name="gestor" id="gestor" onChange={onChangeGestor}>
                                        {
                                        gestorActive.length === 0 ? (<option disabled selected value> -- Seleccionar -- </option>) : (<option value={gestorActive[0].GESTOR[0].id}>{gestorActive[0].GESTOR[0].nombre}</option>)}
                                        {gestoresModal.map((gestor) => {
                                            console.log(gestorActive.length)
                                            console.log(gestor.GESTOR[0].id)
                                            return <option value={gestor.GESTOR[0].id}>{gestor.GESTOR[0].nombre}</option>
                                        })}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Transportista</Label>
                                    <Input type="select" name="transportista" id="transportista" onChange={onChangeTransportista}>
                                        {transportistaActive.length === 0 ? (<option disabled selected value> -- Seleccionar -- </option>) : (<option value={transportistaActive[0].TRANSPORTISTA[0].id}>{transportistaActive[0].TRANSPORTISTA[0].nombre}</option>)}
                                            {transportistasModal.map((transportista) => {
                                            //console.log(transportistaActive)
                                            return <option value={transportista.TRANSPORTISTA[0].id}>{transportista.TRANSPORTISTA[0].nombre}</option>
                                        })}    
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Fecha de Realización</Label>
                                    <Input type="date" name="fecha" id="fecha" onChange={onChangeDate}>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Cantidad</Label>
                                    <Input type="number" name="cantidad" id="cantidad" onChange={onChangeCantidad}> 
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Estado</Label>
                                    <Input type="select" name="estado" id="estado" onChange={onChangeEstado}>
                                        <option disabled selected value> -- Seleccionar -- </option>
                                        {estados.map(estado => {
                                            return (<option value={estado.id}>{estado.nombre}</option>)
                                        })}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Factura Asociada</Label>
                                    <Input type="text" name="factura" id="factura" onChange={onChangeFactura}>
                                    </Input>
                                    {invalidFactura ? (<FormText color="danger">No existe ninguna factura con el número indicado</FormText>) : (<></>)}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12} className="px-2">
                                <FormGroup>
                                    <Label>Observaciones</Label>
                                    <Input type="textarea" name="observaciones" id="observaciones" onChange={onChangeObservaciones}>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <h3>Documentación</h3>
                        <Row>
                            <Col>
                            <div className="App">
                                <Dropzone
                                onDrop={onDrop}

                                >
                                {({
                                    getRootProps,
                                    getInputProps,
                                    isDragActive,
                                    isDragAccept,
                                    isDragReject
                                }) => {
                                    const additionalClass = isDragAccept
                                    ? "accept"
                                    : isDragReject
                                        ? "reject"
                                        : "";

                                    return (
                                    <div 
                                        {...getRootProps({
                                        className: `dropzone ${additionalClass}`
                                        })}
                                    >
                                        <input {...getInputProps()} />
                                        <span>{isDragActive ? "📂" : "📁"}</span>
                                        <p>Suelta aquí los documentos o haz click para seleccionarlos.</p>
                                    </div>
                                    );
                                }}
                                </Dropzone>
                                <div>
                                <strong>Documentos:</strong>
                                <ul>
                                    {fileNames.map(fileName => (
                                    <li key={fileName.NOMBRE}>
                                        <span><a href={`${API_INPRONET}/${fileName.RUTA}`} style={{padding: "20px"}}>{fileName.NOMBRE}</a></span>
                                        {fileName.IS_NEW ? 
                                        <select name={fileName.NOMBRE} value={fileName.TIPO_DOCUMENTO_ID} style={{width: "280px"}} onChange={changeType}>
                                        {tipoDocumentos.map(({ ID, nombre }) => (
                                            <option key={ID} value={ID}>
                                            {nombre}
                                            </option>
                                        ))}
                                        </select>
                                        : 
                                        <button>{fileName.TIPO_DOCUMENTO[0].NOMBRE}</button>
                                        }
                                    
                                        {fileName.IS_NEW && (<span onClick={()=> quitarDocumento(fileName)}>Quitar</span>)}
                                    </li>
                                    ))}
                                </ul>
                                </div>
                            </div>
                            </Col>
                        </Row>
                    </Container>  
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={()=>setAddServicioModal(!addServicioModal)}>
                        Cancelar
                    </Button>
                    {' '}
                    <Button color="primary" type="submit" onClick={handleSubmit} disabled={invalidFactura}>
                        Guardar
                    </Button>
                </ModalFooter>
            </Modal>
        )
    }

    //Abrir modal para SERVICIOS REALIZADOS
    const toggleServiciosRealizadosModal = () => {
        setServiciosRealizadosModal(!serviciosRealizadosModal)
    }
    //MODAL PARA AÑADIR SERVICIOS REALIZADOS
    const ServiciosRealizados = ({isOpen, toggle}) => {
        const [clienteSelected, setClienteSelected] = useState()
        const [zonaSelected, setZonaSelected] = useState()
        const [centroSelected, setCentroSelected] = useState()
        const [residuoSelected, setResiduoSelected] = useState()
        const [fechaSelected, setFechaSelected] = useState()
        const [fechasSelected, setFechasSelected] = useState([])
        const [facturaSelected, setFacturaSelected] = useState()
        const [invalidFactura, setInvalidFactura] = useState(false)
        const [zonasModal, setZonasModal] = useState([])
        const [centrosModal, setCentrosModal] = useState([])
        const [residuosModal, setResiduosModal] = useState([])
        const [fechaRealizados, setFechaRealizados] = useState()
        const [estadoSelected, setEstadoSelected] = useState()

        const getZonasByCliente = (e) => {
            setClienteSelected(e.target.value)
            let activeZonas = zonas.filter((zona) => (e.target.value.includes(zona.cliente[0].nombre)))
            setZonasModal(activeZonas)
        }

        const getCentrosByZona = (e) => {
            setZonaSelected(e.target.value)
            client.query({
                query: GET_CENTROS_ZONA,
                variables: {
                    id: e.target.value.toString()
                }
            }).then((res) => {
                let filteredCentros = res.data.getCentrosProductoresView;        
                let activeCentros = filteredCentros.sort((a, b) => a.denominacion.localeCompare(b.denominacion))
                setCentrosModal(activeCentros)
            })
        }

        const getResiduosByCentro = (e) => {
            setCentroSelected(e.target.value)
            client.query({
                query: GET_RESIDUOS_CENTRO,
                variables: {
                    id: e.target.value.toString()
                }
            }).then((res) => {
                let filteredResiduos = res.data.getCentroProductorResiduo;        
                //console.log(filteredResiduos)
                let activeResiduos = filteredResiduos.sort((a, b) => a.residuo[0].nombre.localeCompare(b.residuo[0].nombre))
                //console.log(activeResiduos)
                //activeResiduos.map(act => console.log(act))
                setResiduosModal(activeResiduos)
            })
        }

        const onChangeResiduo = (e) => {
            setResiduoSelected(parseInt(e.target.value))
        }

        const CustomMultipleInput = ({openCalendar, stringDates}) => {
            return (
              <input
                onFocus={openCalendar}
                value={stringDates.join(", ")}
                readOnly
              />
            )
          }

        const compareFacturas = () => {
            return facturas.filter(factura => facturaSelected === factura.numFactura)
        }

        const onFacturaChange = async (e) => {
            setFacturaSelected(e.target.value)
            if(e.target.value === ""){
                setInvalidFactura(false)
              } else {
                const facturaQuery = await client.query({
                  query: GET_FACTURAS_BY_NUMERO,
                  fetchPolicy: 'no-cache',
                  variables: {
                    numFactura: e.target.value
                  }
                })
                const response = await facturaQuery;

                if(response.data.getFacturasView.length === 0){
                  setInvalidFactura(true)
                } else {
                  setInvalidFactura(false)
                }
              }
        }

        const onEstadoChange = (e) => {    
            setEstadoSelected(e.target.value)
        }

        const handleSubmit = async (e) => {
            e.preventDefault()
            const loggedUser = JSON.parse(sessionStorage.getItem("user"))
            var data = new FormData();
            data.append('accion', 'guardarRetiradaRealizadasInproecoCompleta');
            data.append('selectCentroProductorResiduoId', residuoSelected);
            data.append('usuarioId', loggedUser['custom:ID']);
            data.append('fechaRealizacionMultiple', fechaRealizados);
            data.append('estado', estadoSelected ? estadoSelected : '');

            if(compareFacturas().length > 0) {
                data.append('factura', facturaSelected );
            } else {
                data.append('factura', '');
            }
            const requestOptions = {
                method: 'POST',
                body: data
            };

            await fetch(`${API_INPRONET}/core/controller/RetiradaController.php`, requestOptions)
                .then(response => response.text())
                .then(data => {
                    //console.log(data)
            });

            // lastQuery contiene la última query para mantener los filtos de la tabla
            client.query({
                query: getRetiradas,
                fetchPolicy: 'no-cache',
                variables: {
                    offset: 0,
                    limit: 1000,
                    fields: JSON.parse(lastQuery)  // 20000
                }
            }).then((res) => {
                let results = []
                // NO USA LA FUNCIÓN IMPORTADA PORQUE HAY QUE AÑADIR FACTURA
                for (let i = 0; i < res.data.getRetiradasView.length; i++) {
                    res.data.getRetiradasView[i].id = res.data.getRetiradasView[i].ID;
                    res.data.getRetiradasView[i].ESTADO =
                        res.data.getRetiradasView[i].ESTADO === "DOCUMENTACION INSUFICIENTE"
                            ? "DOC. INSUFICIENTE"
                            : res.data.getRetiradasView[i].ESTADO;
                        res.data.getRetiradasView[i].ESTADO =
                        res.data.getRetiradasView[i].ESTADO === "DOCUMENTO ERRÓNEO"
                            ? "DOC. ERRÓNEO"
                            : res.data.getRetiradasView[i].ESTADO;
                    if(res.data.getRetiradasView[i].FECHA_ULTIMO_DOCUMENTO_GESTOR !== null){
                        let dateNoTime = res.data.getRetiradasView[i].FECHA_ULTIMO_DOCUMENTO_GESTOR.split('T')
                        let partsDate = dateNoTime[0].split('-')
                        res.data.getRetiradasView[i].FECHA_ULTIMO_DOCUMENTO_GESTOR = `${partsDate[2]}/${partsDate[1]}/${partsDate[0]}`
                    }

                    res.data.getRetiradasView[i].CANTIDAD = 
                            res.data.getRetiradasView[i].CANTIDAD
                                ? parseInt(res.data.getRetiradasView[i].CANTIDAD)
                                : res.data.getRetiradasView[i].CANTIDAD;

                    res.data.getRetiradasView[i].OBSERVACIONES_NEW = ''
                    results.push(res.data.getRetiradasView[i])
                }  
                setRows(results)
            })     
            setServiciosRealizadosModal(!serviciosRealizadosModal)
        }

        return (
            <Modal isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>Crear Servicios Realizados</ModalHeader>
                <ModalBody>                  
                    <Container>
                        <Row>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Cliente</Label>
                                    <Input type="select" name="cliente" id="cliente" onChange={getZonasByCliente}>
                                        <option disabled selected defaultValue> -- Seleccionar -- </option>
                                        {clientes.map(cliente => {
                                            return <option key={cliente.id} value={cliente.nombre}>{cliente.nombre}</option>
                                        })}                                               
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col sm={6} className="px-2">
                                <FormGroup>
                                    <Label>Zona</Label>
                                    <Input type="select" name="zona" id="zona" onChange={getCentrosByZona}>
                                    <option disabled selected value> -- Seleccionar -- </option>
                                        {zonasModal.map(zona => {
                                            return <option value={zona.id}>{zona.nombre}</option>
                                        })}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                        <Col sm={6} className="px-2">
                            <FormGroup>
                                <Label>Centro</Label>
                                <Input type="select" name="centro" id="centro" onChange={getResiduosByCentro}>
                                    <option disabled selected value> -- Seleccionar -- </option>
                                    {centrosModal.map(centro => {
                                        return <option value={centro.id}>{centro.denominacion}</option>
                                    })}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col sm={6} className="px-2">
                            <FormGroup>
                                <Label>Residuo</Label>                          
                                <Input type="select" name="residuo" id="residuo" onChange={onChangeResiduo}>
                                    <option disabled selected value> -- Seleccionar -- </option>
                                    {residuosModal.map((residuo) => {
                                        //console.log(residuo)
                                        return <option value={residuo.id}>{residuo.residuo[0].nombre}</option>
                                    })}
                                </Input>
                            </FormGroup>
                        </Col>
                        </Row>
                        <Row>
                        <Col sm={6} className="px-2">
                            <FormGroup>
                                <Label>Fecha Realización</Label>
                                <DatePicker
                                    className="green"
                                    multiple
                                    type="custom"
                                    weekDays={["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]}
                                    months={["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]}
                                    value={fechaRealizados}
                                    format="DD/MM/YYYY"
                                    onChange={setFechaRealizados}
                                    render={<CustomMultipleInput />}
                                /> 
                            </FormGroup>
                        </Col>
                        <Col sm={6} className="px-2">
                            <FormGroup>
                                <Label>Nº factura</Label>
                                <Input type="text" name="factura" id="factura" onChange={onFacturaChange}
                                >
                                </Input>
                                {invalidFactura ? (<FormText color="danger">Número de factura incorrecto</FormText>) : (<></>)}
                            </FormGroup>
                        </Col>
                        </Row>
                        <Row>
                            <Col sm={6} className="px-2">
                                <Label>Estado</Label>
                                <Input type="select" name="estado" id="estado" onChange={onEstadoChange}>
                                    <option disabled selected value> -- Seleccionar -- </option>
                                    {estados.map(estado => {
                                        return (<option value={estado.nombre}>{estado.nombre}</option>)
                                    })}
                                </Input>
                            </Col>
                        </Row>
                    </Container>  
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={()=>setServiciosRealizadosModal(!serviciosRealizadosModal)}>
                        Cancelar
                    </Button>
                    {' '}
                    <Button color="primary" type="submit" onClick={handleSubmit} disabled={invalidFactura}>
                        Guardar
                    </Button>
                </ModalFooter>
            </Modal>
            
        )
    }

    //Abrir modal de filtro por rango de fechas
    const toggleDatesModal = () => {
        setDatesModal(!datesModal)
    }
    const [formattedStartDateGlobal, setFormattedStartDateGlobal] = useState()
    const [formattedEndDateGlobal, setFormattedEndDateGlobal] = useState()
    //MODAL PARA FILTRAR POR RANGO DE FECHAS
    const DatesRangeFilter = ({isOpen, toggle}) => {
        const [startDate, setStartDate] = useState();
        const [endDate, setEndDate] = useState()
        const [formattedStartDate, setFormattedStartDate] = useState()
        const [formattedEndDate, setFormattedEndDate] = useState()
      
        const handleOnStartChange = (val) => {
            const parts = val.split("T")
            const date = parts[0].replace(/-/g, "")
            setFormattedStartDate(date)
            setStartDate(val);
        };

        const handleOnEndChange = (val) => {
            const parts = val.split("T")
            const date = parts[0].replace(/-/g, "")
            setFormattedEndDate(date)
            setEndDate(val);
        };

        const filterDate = () => {
            setRowsStore(rows)
            setFormattedStartDateGlobal(formattedStartDate)
            setFormattedEndDateGlobal(formattedEndDate)
            client.query({
                query: getRetiradasByFechaRealizacion,
                fetchPolicy: 'no-cache',
                variables: {
                    limit: 1000,
                    dates: `${formattedStartDate}..${formattedEndDate}`
                }
            }).then((res) => {
                let results = GET_RESULTS_SERVICIOS(res)
                setRows(results)
                setDateFilter(results)
                setDatesModal(!datesModal)
            })     
        }

        return (
            <Modal isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>Filtro por fecha</ModalHeader>
                <ModalBody>
                    <div>Fecha de Inicio</div>
                    <DatePickerRangoFechas value={startDate} onChange={handleOnStartChange} />
                    <div>Fecha final</div>
                    <DatePickerRangoFechas value={endDate} onChange={handleOnEndChange}/>
                </ModalBody> 
                <ModalFooter>
                <Button color="primary" onClick={filterDate} >Buscar</Button>
                </ModalFooter>
            </Modal>

        );
      };

      /* const getFactura = (id) => {
        client.query({
            query: GET_FACTURA_RETIRADA,
            variables: {
                id: id.toString()
            }
            }).then((res) => {
            console.log("FACTURA", res.data)
            return res.data.getRetirada[0].numFactura;
        })
      } */

    const compareDates = (a, b) => {
        if(a == null){
            a = "1915/01/01"
        }
        if(b == null){
            b = "1915/01/01"
        }

        const parts = a.split("/")
        const dateA = new Date(parts[2], parts[1] - 1, parts[0]);

        const partsB = b.split("/")
        const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);

        if (dateA == dateB) {
            return 0;
        }
        return (dateA < dateB) ? -1 : 1; 
    };

    const [integratedSortingColumnExtensions] = useState([
        { columnName: 'FECHA_REALIZACION', compare: compareDates },
        { columnName: 'FECHA_SOLICITUD', compare: compareDates },
        { columnName: 'FECHA_ULTIMO_DOCUMENTO_GESTOR', compare: compareDates },
      ]);

    // Pedimos los datos de las retiradas iniciales
    const remoteData = () => {
        return client.query({
            query: getRetiradas,
            fetchPolicy: 'no-cache',
            variables: {
                offset: 0,
                limit: 1000  // 20000
            }
        }).then((res) => {
            const results = GET_RESULTS_SERVICIOS(res)
            setRows(results)
        })
    }
    // Listado de columnas a mostrar en la tabla
    const [columns] = useState([
        { name: "ID", title: "id" },
        { name: "CLIENTE", title: "Cliente"},
        { name: "ZONA", title: "Zona" },
        { name: "CENTRO", title: "Centro" },
        { name: "RESIDUO", title: "Residuo" },
        { name: "FECHA_REALIZACION", title: "Fecha Realización" },
        { name: "CANTIDAD", title: "Cantidad" },
        { name: "ESTADO", title: "Estado" },
        { name: "GESTOR", title: "Gestor" },
        { name: "OBSERVACIONES", title: "Observaciones" },
        { name: "TRANSPORTISTA", title: "Transportista" },
        { name: "FECHA_SOLICITUD", title: "Fecha Solicitud" },
        { name: "SOLICITANTE", title: "Solicitante" },
        { name: "FECHA_ULTIMO_DOCUMENTO_GESTOR", title: "Fecha ult doc" }
    ]);

    // Estado compartido entre los componentes a través del contexto
    const [value, setValue] = useState(null);

    const [rows, setRows] = useState(null);
    const [rowsStore, setRowsStore] = useState(null);
    const [filterRows, setFilterRows] = useState(null);
    const [rowsExport, setRowsExport] = useState(null);
    const [queryString, setQueryString] = useState(null);

    const [filtersApplied, setFiltersApplied] = useState([])
    //const [globalFilter, setGlobalFilter] = useState(null)

    //ESTADO PARA EL INPUT DE BÚSQUEDA GENERAL
    const [searchValue, setSearchState] = useState('');

    //PRUEBA PARA UNIFICAR EL FILTRO GENERAL Y LOS FILTROS POR COLUMNA
    /* const fetchData = async (value) => {
        let results = [];
        await columns.reduce(async (acc, column) => {
            await acc
            let mainFilter;
            //setQueryString(mainFilter)
            
            if(filtersApplied.length === 0){
                mainFilter = `{"${column.name}": "*${value}*"}`;
                const queryFilter = await client.query({
                    query: getRetiradasFilter,
                    fetchPolicy: 'no-cache',
                    variables:{
                        limit: 500,
                        fields: JSON.parse(mainFilter),
                    }
                })
                const res = await queryFilter
    
                if(res.data.getRetiradasView.length !== 0){
                    //console.log(res.data.getRetiradasView)
                    for(let i = 0; i < res.data.getRetiradasView.length; i++){
                        //results = GET_RESULTS_SERVICIOS(res)
                        results.push(res.data.getRetiradasView[i])
                    }
                } 
            } else {
                //console.log('hay filters')
                let filtro = getQueryString()
                let filtroParsed = JSON.parse(filtro)
                let arrayFilters = Object.keys(filtroParsed)
                //console.log(arrayFilters)
                arrayFilters.filter(arr => !column.name.includes(arr))
                //console.log(arrayFilters)
                if(!arrayFilters.includes(column.name)){
                    console.log(column.name)
                    mainFilter = `{"${column.name}": "*${value}*"}`;
                    const queryFilter = await client.query({
                        query: getRetiradasFilter,
                        fetchPolicy: 'no-cache',
                        variables:{
                            limit: 500,
                            fields: JSON.parse(mainFilter),
                        }
                    })
                    const res = await queryFilter
        
                    if(res.data.getRetiradasView.length !== 0){
                        //console.log(res.data.getRetiradasView)
                        for(let i = 0; i < res.data.getRetiradasView.length; i++){
                            //results = GET_RESULTS_SERVICIOS(res)
                            results.push(res.data.getRetiradasView[i])
                        }
                    } 
                } else {
                    console.log(filtro)
                    const queryFilter = await client.query({
                        query: getRetiradasFilter,
                        fetchPolicy: 'no-cache',
                        variables:{
                            limit: 500,
                            fields: JSON.parse(filtro),
                        }
                    })
                    const res = await queryFilter
        
                    if(res.data.getRetiradasView.length !== 0){
                        //console.log(res.data.getRetiradasView)
                        for(let i = 0; i < res.data.getRetiradasView.length; i++){
                            //results = GET_RESULTS_SERVICIOS(res)
                            results.push(res.data.getRetiradasView[i])
                        }
                    } 
                }
            }
            
        },columns[0])

        let row = {};
        results = results.filter((current) => {
            let exists = !row[current.ID];
            row[current.ID] = true;
            return exists;
        });
        console.log(results)
        return results
    } */  

    // PROCESO PARA HACER PETICIONES A LA BBDD CON CADA CAMBIO DE FILTRO
    const [loading, setLoading] = useState(false);
    const [lastQuery, setLastQuery] = useState();

    const getQueryString = () => {
        let filter = filtersApplied.reduce((acc, { columnName, value }) => {     
            if (Array.isArray(value) && value.length>0) {
                acc.push(`"${columnName}": "(${value})"`);
            } else if(value.length>2){
                acc.push(`"${columnName}": "\*${value}*"`);
            }
            return acc;  
                  
        }, []).join(',');
    
        if (filtersApplied.length > 1) {
          filter = `${filter}`;
        }
        if(filter && formattedStartDateGlobal && formattedEndDateGlobal) {
            filter = filter + `, "FECHA_REALIZACION_ORDEN":  "${formattedStartDateGlobal}..${formattedEndDateGlobal}"`
        }
        if(filter && clickedPendienteRevisar) {
            filter = filter + `, "PENDIENTE_REVISAR": "1"`
        }
        if(filter && clickedPendienteObservacion) {
            filter = filter + `, "PENDIENTE_REVISAR_OBSERVACIONES": "1"`
        }
        if(filter && clickedPeligrosoSinFecha) {
            filter = filter + `, "PELIGROSO_SIN_FECHA": "1"`
        }
        //console.log(filter)
        return `{${filter}}`;
      };

      const loadData = (excelExport=false) => {
        const queryString = getQueryString();    
        let limit = excelExport ? 5000:500;
        console.log(JSON.parse(queryString))
        if ((queryString && excelExport) || (queryString !== lastQuery && !loading)) {
            client.query({
                query: getRetiradasFilter,
                variables:{
                    limit: limit,
                    fields: JSON.parse(queryString),
                    //fields: {CLIENTE: `(${queryString})`}
                }
            }).then((res)=> {
                const results = GET_RESULTS_SERVICIOS(res)
                if (!excelExport) {
                    setRows(results);
                    setLastQuery(queryString);
                } else {
                    console.log("exporting...")
                    setRowsExport(results, ()=> startExport(rowsExport))
                    startExport()
                }
            })
           if(!excelExport) setLastQuery(queryString);
        }
    };
    
    useEffect(() => loadData());
    // END PROCESO PARA HACER PETICIONES A LA BBDD CON CADA CAMBIO DE FILTRO

    const [newEstado, setNewEstado] = useState(null);
    const [oldEstado, setOldEstado] = useState(null);
    const [changedId, setChangedId] = useState(null)

    const [expandedRows, setExpandedRows] = useState([]);
    const [pendientes, setPendientes] = useState(null);
    const [serviciosRealizados, setServiciosRealizados] = useState(null);
    const [dateFilter, setDateFilter] = useState(null);
    const [tableColumnExtensions] = useState([
         { columnName: 'ID',  width: 85 },
         { columnName: 'ESTADO',  width: 250 },
    ]);

    //const hiddenColumnNames = ['CANTIDAD']
    
    useEffect(() => {
        remoteData("test")
    }, [])

    const [filteringColumnExtensions, setFilteringColumnExtensions] = useState([
        {columnName: 'CLIENTE', predicate: columnFilterMultiPredicate},
        {columnName: 'ZONA', predicate: columnFilterMultiPredicate},
        {columnName: 'CENTRO', predicate: columnFilterMultiPredicate},
        {columnName: 'TRANSPORTISTA', predicate: columnFilterMultiPredicate},
        {columnName: 'GESTOR', predicate: columnFilterMultiPredicate},
        {columnName: 'RESIDUO', predicate: columnFilterMultiPredicate},
        {columnName: 'ESTADO', predicate: columnFilterMultiPredicate}
      ]);

    const clearFilters = () => {
        //setSelected([])
        
        clickedOption = []
        clickedOptionCentro = []
        clickedOptionZona = []
        clickedOptionResiduo = []
        //setPendientes([])
        setValue(null)
        setFiltersApplied([])
        if(dateFilter && dateFilter.length > 0){
            setDateFilter([])
            setRows(rowsStore)
            setFormattedStartDateGlobal(null)
            setFormattedEndDateGlobal(null)
        }
        if(clickedPendienteRevisar || clickedPeligrosoSinFecha || clickedPendienteObservacion){
            setClickedPendienteRevisar(false)
            setClickedPeligrosoSinFecha(false)
            setClickedPendienteObservacion(false)
            setRows(rowsStore)
            setRowsStore([])
            setPendientes([])
        }
        setSearchState('')
    }   

    const commitChanges = async ({ added, changed, deleted }) => {
        //console.log(added, changed, deleted)
        console.log("Commit")
        let changedRows;
        if (added) {
            const startingAddedId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 0;
            changedRows = [
                ...rows,
                ...added.map((row, index) => ({
                    id: startingAddedId + index,
                    ...row,
                })),
            ];
        }
        if (changed) {
            let id = null;
            let activeRow = {};

            // updateTodo({ variables: {id, OBSERVACIONES: input.value } });
            changedRows = rows.map(row => {
                if (changed[row.id]) {
                    id = row.id;
                    activeRow = row;
                    return { ...row, ...changed[row.id] }
                } else {
                    return row;
                }
            });

            if (id && changed[id]) {
                let variables = {}

                const fields = Object.keys(changed[id]);
                for (let i = 0; i < fields.length; i++) {

                    let field = fields[i];
                    /* SEND MUTATION AND UPDATE THE CACHE MANUALLY */
                    variables.ID = id.toString();
                    variables[field] = changed[id][field]
                    activeRow[field] = changed[id][field]
                }
                // console.log(changedRows, activeRow);

                // AJAX CALL A BACKEND PHP
                const loggedUser = JSON.parse(sessionStorage.getItem("user"))
                activeRow['onEdit'] = true
                activeRow['PENDIENTE_REVISAR_OBSERVACIONES'] = false
                //activeRow['PENDIENTE_REVISAR'] = false
                
                if(oldEstado !== activeRow['ESTADO']){
                    setNewEstado(true)
                    setChangedId(id)
                }

                var data = new FormData();
                data.append('accion', "editarRetirada" );
                data.append('servicioId', id );
                data.append('nickname', loggedUser.nickname);
                data.append('role', loggedUser['custom:Rol']);
                data.append('fechaAlta', activeRow['FECHA_SOLICITUD'] );
                data.append('selectGestorIdEdit', activeRow['GESTOR_ID'] );
                data.append('selectTransportistaId', activeRow['TRANSPORTISTA_ID'] );
                data.append('fechaRealizacion', activeRow['FECHA_REALIZACION'] ? activeRow['FECHA_REALIZACION'] : '' );
                data.append('cantidad', activeRow['CANTIDAD'] );
                data.append('selectEstadoId', activeRow['ESTADO_RETIRADA_ID'] );
                data.append('observaciones', activeRow['OBSERVACIONES_NEW'] );
                data.append('idResiduo',activeRow['RESIDUO_ID'] );
                data.append('selectCentroProductorResiduoId', activeRow['CENTRO_PRODUCTOR_RESIDUO_ID'] );
                data.append('selectUsuarioId', loggedUser['custom:ID']);
                //Comprobación si la factura existe en BBDD, si no existe se envía la petición con un string vacío
                //TODO mensaje de advertencia de que el número de factura es incorrecto
                const facturaExists = facturas.filter(factura => activeRow['FACTURA'] === factura.numFactura)
                if(facturaExists.length > 0) {
                    data.append('factura', activeRow['FACTURA'] );
                } else {
                    activeRow['FACTURA'] = ''
                    data.append('factura', '');
                }

                const requestOptions = {
                    method: 'POST',
                    body: data
                };
                
                await fetch(`${API_INPRONET}/core/controller/RetiradaController.php`, requestOptions)
                    .then(response => response.text())
                    .then(data => {
                        console.log(data)
                       // setExpandedRows([]);
                    });

                client.query({
                    query: getRetiradas,
                    fetchPolicy: 'no-cache',
                    variables: {
                        offset: 0,
                        limit: 1000,
                        fields: lastQuery
                    }
                }).then((res) => {
                    let results = []
                    for (let i = 0; i < res.data.getRetiradasView.length; i++) {
                        res.data.getRetiradasView[i].id = res.data.getRetiradasView[i].ID;
                        res.data.getRetiradasView[i].ESTADO =
                            res.data.getRetiradasView[i].ESTADO === "DOCUMENTACION INSUFICIENTE"
                                ? "DOC. INSUFICIENTE"
                                : res.data.getRetiradasView[i].ESTADO;
                            res.data.getRetiradasView[i].ESTADO =
                            res.data.getRetiradasView[i].ESTADO === "DOCUMENTO ERRÓNEO"
                                ? "DOC. ERRÓNEO"
                                : res.data.getRetiradasView[i].ESTADO;
                        if(res.data.getRetiradasView[i].FECHA_ULTIMO_DOCUMENTO_GESTOR !== null){
                            let dateNoTime = res.data.getRetiradasView[i].FECHA_ULTIMO_DOCUMENTO_GESTOR.split('T')
                            let partsDate = dateNoTime[0].split('-')
                            res.data.getRetiradasView[i].FECHA_ULTIMO_DOCUMENTO_GESTOR = `${partsDate[2]}/${partsDate[1]}/${partsDate[0]}`
                        }
                        //Al servicio que se ha editado le ponemos onEdit para que se ponga verde
                        if(res.data.getRetiradasView[i].id === id){
                            res.data.getRetiradasView[i].onEdit = true
                            //Al servicio editado se le asigna su factura
                            if(activeRow['FACTURA'] !== ""){
                                res.data.getRetiradasView[i].FACTURA = activeRow['FACTURA']
                            }
                        }

                        res.data.getRetiradasView[i].CANTIDAD = 
                            res.data.getRetiradasView[i].CANTIDAD
                                ? parseInt(res.data.getRetiradasView[i].CANTIDAD)
                                : res.data.getRetiradasView[i].CANTIDAD;

                        res.data.getRetiradasView[i].OBSERVACIONES_NEW = ''
                        results.push(res.data.getRetiradasView[i])
                    }  

                    setRowsStore(results)
                    setRows(results)
                })
            }
        }
        if (deleted) {
            const deletedSet = new Set(deleted);
            changedRows = rows.filter(row => !deletedSet.has(row.id));
        }
        
        setRows(changedRows);
    };

    if (!rows) {
        return "Cargando...";
    }

    return (
        <Context.Provider value={{value, setValue, rows, setRows, lastQuery, oldEstado, setOldEstado, newEstado, setNewEstado, changedId, setChangedId}}>
        <div>
            <div className="content">
                <Row>
                    <Col xs={12} md={12}>

                        <div className="page-title">
                            <div className="float-left">
                                <h2 className="title">Servicios</h2>
                            </div>
                        </div>
                        <div className="col-12">
                            <section className="box ">
                                {/* <header className="panel_header">
                                    <h2 className="title float-left">Edición</h2>

                                </header>                           */}
                                <div class="col-md-4">
                                    <div class="form-row">
                                        <div class="pendientes__servicios">
                                        <div class="col-md-12">
                                            <input type="checkbox" onClick={(e)=>togglePendientes("PENDIENTE_REVISAR")} checked={clickedPendienteRevisar}></input> Ver pendientes de revisión
                                        </div>
                                        <div class="col-md-12">
                                            <input type="checkbox" onClick={(e)=>togglePendientes("PENDIENTE_REVISAR_OBSERVACIONES")} checked={clickedPendienteObservacion}></input> Ver pendientes de revisión de observaciones
                                        </div>
                                        <div class="col-md-12">
                                            <input type="checkbox" onClick={(e)=>togglePendientes("PELIGROSO_SIN_FECHA")} checked={clickedPeligrosoSinFecha}></input> Ver peligrosos sin fecha realización más de 10 dias
                                        </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="content-body">
                                    <div className="row">
                                        <div className="col-lg-12 card">
                                            <Grid
                                                rows={rows}
                                                columns={columns}
                                                getRowId={getRowId}
                                            >
                                                <SearchState 
                                                    value={searchValue}
                                                    onValueChange={async (val)=>{
                                                        setSearchState(val)
                                                        setRowsStore(rows)
                                                        /* let mainFilter = [{
                                                            columnName: "allColumns",
                                                            value: val
                                                        }] */
                                                        //Le pasamos el filtro general en formato array
                                                        //setFiltersApplied(mainFilter)
                                                        /* if(val.length === 0){
                                                            setRows(rowsStore)
                                                        }
                                                        if(val.length > 2){
                                                            const datos = await fetchData(val)
                                                            setRows(datos)
                                                        }  */
                                                    }}
                                                />
                                                
                                                <FilteringState filters={filtersApplied} onFiltersChange={(filter) => setFiltersApplied(filter)}/>
                                                {/* <EditingState
                                                    onCommitChanges={commitChanges}
                                                /> */}
                                                <RowDetailState
                                                   // expandedRowIds={expandedRows}
                                                />
                                                <EditingState
                                                    defaultEditingRowIds={[1]}
                                                    onCommitChanges={commitChanges}
                                                    
                                                />
                                                {/* <IntegratedFiltering columnExtensions={filteringColumnExtensions}  /> */}
                                                {/* <PagingState
                                                    defaultCurrentPage={0}
                                                    defaultPageSize={5}
                                                />
                                                <IntegratedPaging /> */}
                                                <SortingState
                                                    //defaultSorting={[{ columnName: 'ID', direction: 'desc' }]}
                                                />

                                                <IntegratedSorting 
                                                    columnExtensions={integratedSortingColumnExtensions}
                                                />
                                                <VirtualTable
                                                 columnExtensions={tableColumnExtensions} 
                                                 rowComponent={({ children, row }) => {
                                                     //console.log(row)
                                                     return (                    
                                                        <tr
                                                            onClick={(e) => {
                                                                // Código para hacer scroll a la fila en edición
                                                                // Hay que subir por el dom a los hermanos pq si no, se tapa con el header de la tabla
                                                                let elementToScrollTo = e.target.parentElement.parentElement;
                                                                let noscroll = true;
                                                                const childOffset = 3; // Sólo a partir del cuarto
                                                                for (let i = 0; i < childOffset; i++) {
                                                                    if (!elementToScrollTo.previousElementSibling || elementToScrollTo.previousElementSibling.tagName!="TR") {
                                                                    noscroll = false;
                                                                    break;
                                                                    }
                                                                    elementToScrollTo = elementToScrollTo.previousElementSibling;                                                           
                                                                }
                                                                // usamos scrollIntoView
                                                                if(noscroll) elementToScrollTo.firstChild.firstChild.scrollIntoView()                                                       
                                                            }}

                                                            style={
                                                                row.onEdit ? styles.onEdit : null ||
                                                                row.PENDIENTE_REVISAR_OBSERVACIONES ? styles.pendienteObservaciones : null ||
                                                                row.PENDIENTE_REVISAR ? styles.pendiente : null ||
                                                                row.PELIGROSO_SIN_FECHA ? styles.peligrosoSinFecha : null 
                                                            }
                                                            >
                                                            {children}
                                                        </tr>
                                                )}} />

                                                <TableHeaderRow showSortingControls/>
                                                <TableColumnVisibility
                                                /* hiddenColumnNames={hiddenColumnNames} */
                                                />
                                                <Toolbar />
                                                <SearchPanel 
                                                    messages={{searchPlaceholder:"Buscar..."}}
                                                    />
                                                <ExportPanel 
                                                    messages={exportMessages}
                                                    startExport={()=>loadData(true)} />
                                                
                                                 <TableRowDetail
                                                    contentComponent={DetailContent}
                                                    cellComponent={DetailCell}
                                                    toggleCellComponent={ToggleCell}
                                                />
        

                                                <DetailEditCell />
                                                {/* <TableInlineCellEditing /> */}


                                                <TableFilterRow

                                                    cellComponent={FilterCell}
                                                    messages={filterRowMessages}
                                                />
                                                
                                                {/* <PagingPanel
                                                    pageSizes={[10, 25, 50]}
                                                /> */}
                                                <Template name="root">  
                                                    <TemplateConnector>  
                                                    {({ rows: filteredRows }) => {  
                                                        setFilterRows(filteredRows);
                                                        return <TemplatePlaceholder />;  
                                                    }}  
                                                    </TemplateConnector>  
                                                </Template>  
                                            </Grid>
                                            <GridExporter
                                                ref={exporterRef}
                                                rows={rowsExport}
                                                columns={columns}
                                                onSave={onSave}
                                            />
                                        </div>
                                    </div>
                                     <div class="results">
                                        Se han encontrado <p> {filterRows && filterRows.length} </p> resultados
                                     </div>
                                     <div className="botones-footer">
                                        <button className="botones-footer__button" onClick={toggleAddServicioModal}>Añadir Servicio</button>
                                        <button className="botones-footer__button" onClick={toggleDatesModal}>Seleccionar Fecha</button>                               
                                        <button className="botones-footer__button" onClick={toggleServiciosRealizadosModal}>Servicios realizados</button>
                                        <button className="botones-footer__button" onClick={clearFilters}>Limpiar filtros</button>
                                     </div>
                                </div>
                                {/* CARGA DE MODALES PARA LOS BOTONES */} 
                                <AddServicio isOpen={addServicioModal} toggle={toggleAddServicioModal}/>
                                <DatesRangeFilter isOpen={datesModal} toggle={toggleDatesModal}/>
                                <ServiciosRealizados isOpen={serviciosRealizadosModal} toggle={toggleServiciosRealizadosModal}/>
                            </section>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
        </Context.Provider>
    );
}


