import FormularioNuevaVenta from '../views/crm/Ventas/FormularioNuevaVenta';
import RegistroVentas from '../views/crm/Ventas/RegistroVentas';

var BASEDIR = process.env.REACT_APP_BASEDIR;

var dashRoutes = [ 
    { path: BASEDIR+"/crm/nueva-venta", name: "Nueva Venta", component: FormularioNuevaVenta},
    { path: BASEDIR+"/crm/registro-ventas", name: "Registro Ventas", component: RegistroVentas},
];
export default dashRoutes;
