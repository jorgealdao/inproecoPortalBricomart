import moment from 'moment'; // Example for onSort prop
import React from 'react'; // Import React
//import { render } from 'react-dom'; // Import render method
import Datatable from 'react-bs-datatable'; // Import this package
import {
    Row, Col,
} from 'reactstrap';
import {client,getRetiradas,getTotalCount} from "../../../components/graphql";

const header = [
  { title: 'Centro', prop: 'CENTRO', sortable: true, filterable: true },
  { title: 'Cantidad Recogida', prop: 'CANTIDAD', sortable: true, filterable: true },
  { title: 'Centro Productor', prop: 'CENTRO_PRODUCTOR_ID', sortable: true, filterable: true },
  { title: 'Cliente', prop: 'CLIENTE', sortable: true, filterable: true },
  { title: 'Estado', prop: 'ESTADO', sortable: true, filterable: true },
  { title: 'Transportista', prop: 'TRANSPORTISTA', sortable: true, filterable: true },
  { title: 'Zona', prop: 'ZONA', sortable: true, filterable: true },
  { title: 'Gestor', prop: 'GESTOR', sortable: true, filterable: true },
  { title: 'Fecha Solicitud', prop: 'FECHA_SOLICITUD', sortable: true, filterable: true },

];

let totalCount = 0;
let results = []

const remoteData = (query)=>{
    //console.log("Query object - ",query)
    //let sort = query.orderBy ? query.orderBy.field : 'CENTRO'
    //if(query.orderDirection === "desc") sort = "-" + sort;
    if(totalCount == 0) {
    client.query({ query: getTotalCount}).then((res) => {
        console.log(res.data.countretiradas[0].Products)
        totalCount =  res.data.countretiradas[0].Products
    }
    );}
    console.log(totalCount);
    return client.query({
        query:getRetiradas, 
        variables:{
            offset:0,
            limit:5000,
            sort: "FECHA_SOLICITUD"
        } 
    }).then((res)=>{
        console.log(res.data)
        return {
            data:res.data.RETIRADAS_VIEW,
            page:query.page,
            totalCount:totalCount
        }
    })
}
const onSortFunction = {
  date(columnValue) {
    // Convert the string date format to UTC timestamp
    // So the table could sort it by number instead of by string
    return moment(columnValue, 'Do MMMM YYYY').valueOf();
  },
};

const customLabels = {
  first: '<<',
  last: '>>',
  prev: '<',
  next: '>',
  show: 'Mostrar ',
  entries: ' filas',
  noResults: 'Aún no hay resultados.',
  filterPlaceholder: 'Introducir texto'
};
function onRowClick(data) {
    console.log("entro")
    //alert(`You clicked on the row ${data.realname}`);
  }
class Lead extends React.Component{
    constructor(props) {
        super(props);
        this.state = {results: ''};
        remoteData("test").then(data =>
            {
                this.setState({results: data.data});
            });
        
      }
    onRowClick(row) {
        alert(`You clicked on the row ${JSON.stringify(row)}`);
    }
    render(){
        
        return (
            <div>
                <div className="content">
                    <Row>
                        <Col xs={12} md={12}>

                    <div className="page-title">
                        <div className="float-left">
                            <h1 className="title">Servicios</h1>
                            <div>{results}</div>
                        </div>
                    </div>


                          

                    <div className="col-12">
                        <section className="box ">
                            <header className="panel_header">
                                <h2 className="title float-left">Listado de servicios</h2>
                                
                            </header>
                            <div className="content-body">
                                <div className="row">
                                    <div className="col-lg-12 dt-disp">
                            
  <Datatable
  tableHeader={header}
  tableBody={this.state.results}
  keyName="userTable"
  tableClass="striped table-hover table-responsive"
  rowsPerPage={10}
  rowsPerPageOption={[5, 10, 15, 20]}
  initialSort={{prop: "CENTRO", isAscending: true}}
  onSort={onSortFunction}
  labels={customLabels}
  placeholder="Introducir texto"
  onRowClick={this.onRowClick}
/>

                               

                                    </div>
                                </div>


                            </div>
                        </section>
                    </div>


                        </Col>

                    </Row>
                </div>
            </div>
        );
    }
}

export default Lead;
