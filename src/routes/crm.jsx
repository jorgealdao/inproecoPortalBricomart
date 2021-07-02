import General from 'views/general/Dashboard/General.jsx';
import Hospital from 'views/hospital/Dashboard/Hospital.jsx';
import Music from 'views/music/Dashboard/Music.jsx';
import Crm from 'views/crm/Dashboard/Crm.jsx';
import Social from 'views/social/Dashboard/Social.jsx';
import Freelance from 'views/freelance/Dashboard/Freelance.jsx';
import University from 'views/university/Dashboard/University.jsx';
import Ecommerce from 'views/ecommerce/Dashboard/Ecommerce.jsx';
import Blog from 'views/blog/Dashboard/Blog.jsx';

import Lead from 'views/crm/Lead/Lead.jsx';
import AddLead from 'views/crm/Lead/AddLead.jsx';
import EditLead from 'views/crm/Lead/EditLead.jsx';

import Vendor from 'views/crm/Vendor/Vendor.jsx';
import AddVendor from 'views/crm/Vendor/AddVendor.jsx';
import EditVendor from 'views/crm/Vendor/EditVendor.jsx';

import Contact from 'views/crm/Contact/Contact.jsx';
import AddContact from 'views/crm/Contact/AddContact.jsx';
import EditContact from 'views/crm/Contact/EditContact.jsx';

import User from 'views/crm/User/User.jsx';
import AddUser from 'views/crm/User/AddUser.jsx';
import EditUser from 'views/crm/User/EditUser.jsx';

import Customer from 'views/crm/Customer/Customer.jsx';
import AddCustomer from 'views/crm/Customer/AddCustomer.jsx';
import EditCustomer from 'views/crm/Customer/EditCustomer.jsx';


import Quote from 'views/crm/Quote/Quote.jsx';
import AddQuote from 'views/crm/Quote/AddQuote.jsx';
import EditQuote from 'views/crm/Quote/EditQuote.jsx';

import Invoice from 'views/crm/Invoice/Invoice.jsx';
import AddInvoice from 'views/crm/Invoice/AddInvoice.jsx';
import EditInvoice from 'views/crm/Invoice/EditInvoice.jsx';


import Ticket from 'views/crm/Ticket/Ticket.jsx';
import AddTicket from 'views/crm/Ticket/AddTicket.jsx';
import EditTicket from 'views/crm/Ticket/EditTicket.jsx';

import CrmMailinbox from 'views/crm/Mail/Inbox.jsx';
import CrmMailcompose from 'views/crm/Mail/Compose.jsx';
import CrmMailview from 'views/crm/Mail/View.jsx';

import CrmEvents from 'views/crm/Events/CrmEvents.jsx';
import AddEvent from 'views/crm/Events/AddEvent.jsx';

import CrmReportsSales from 'views/crm/Reports/ReportsSales.jsx'; 
import CrmReportsCustomers from 'views/crm/Reports/ReportsCustomers.jsx'; 
import CrmReportsTargets from 'views/crm/Reports/ReportsTargets.jsx'; 
import CrmReportsVendors from 'views/crm/Reports/ReportsVendors.jsx'; 

import Servicios from 'views/crm/Servicios/Servicios.jsx';
import GestionServicios from 'views/crm/Servicios/GestionServicios.jsx';
import Facturacion from '../views/crm/Facturacion/Facturacion';
import ServiciosFactura from '../views/crm/Facturacion/ServiciosFactura';

import Login from 'views/crm/Login/Login.jsx'


import Pages from 'views/blog/Page/Pages.jsx';
import ForgottenPassword from '../views/crm/Login/ForgottenPassword';
import SignUp from '../views/crm/Login/SignUp';

var BASEDIR = process.env.REACT_APP_BASEDIR;

var dashRoutes = [ 

    //{ path: "#", name: "Main", type: "navgroup"},
    /* { path: BASEDIR+"/crm/login", name: "Login", icon: "", badge: "", component: Login }, */
    /* { path: BASEDIR+"/crm/forgotten-password", name: "Forgotten Password", icon: "", badge: "", component: ForgottenPassword },
    { path: BASEDIR+"/crm/sign-up", name: "Registro", icon: "", badge: "", component: SignUp }, */
    { path: BASEDIR+"/crm/dashboard", name: "Noticias", icon: "speedometer", badge: "", component: Pages },
    { path: BASEDIR+"/crm/servicios", name: "Servicios BORRAR", component: Servicios},
    { path: BASEDIR+"/crm/gestion-servicios", name: "Gestión Servicios", component: GestionServicios},
    { path: BASEDIR+"/crm/facturacion", name: "Facturación", component: Facturacion },
    { path: BASEDIR+"/crm/pdf-servicios", name: "PDF SERVICIOS", component: ServiciosFactura },

    /* { 
        path: "#", name: "Clientes", icon: "people", type: "dropdown", parentid: "customers",
            child: [
                { path: BASEDIR+"/crm/clientes", name: "Clientes", loc: "https://inpronet.es/inproecoweb2_0/clientes.php"},
                { path: BASEDIR+"/crm/centros-productores", name: "Centros Productores", loc:"https://inpronet.es/inproecoweb2_0/centros_productores.php"},
                { path: BASEDIR+"/crm/gestion-incidencias", name: "Gestión de Incidencias", loc:"https://inpronet.es/inproecoweb2_0/incidencias_clientes.php"},
            ]
    },
        // { path: BASEDIR+"/crm/clientes", component: Customer, type: "child", loc: "http://inpronet-prod.eba-pijyi83u.eu-west-1.elasticbeanstalk.com/inproecoweb2_0/clientes.php"},
        { path: BASEDIR+"/crm/centros-productores", component: AddCustomer, type: "child"},
        { path: BASEDIR+"/crm/gestion-incidencias", component: EditCustomer, type: "child"},


    { 
        path: "#", name: "Gestión de Servicios", icon: "event", type: "dropdown", parentid: "leads",
            child: [
                { path: BASEDIR+"/crm/servicios", name: "Servicios"},
                { path: BASEDIR+"/crm/servicios-programados", name: "Servicios Programados"},
                { path: BASEDIR+"/crm/servicios-leroy-materiales", name: "Servicios Leroy Materiales"},
                { path: BASEDIR+"/crm/servicios-leroy-instalaciones", name: "Servicios Leroy Instalaciones"},
            ]
    },

        { path: BASEDIR+"/crm/servicios", component: Servicios, type: "child"},
        { path: BASEDIR+"/crm/servicios-programados", component: ServiciosProgramados, type: "child"},
        { path: BASEDIR+"/crm/servicios-leroy-materiales", component: ServiciosLeroyM, type: "child"},
        { path: BASEDIR+"/crm/servicios-leroy-instalaciones", component: LeroyInstalaciones, type: "child"},


    { 
        path: "#", name: "Gestores/Transportistas", icon: "user", type: "dropdown", parentid: "vendors",
            child: [
                { path: BASEDIR+"/crm/gestores", name: "Gestores", loc: "https://inpronet.es/inproecoweb2_0/gestores.php"},
                { path: BASEDIR+"/crm/ofertas-gestores", name: "Ofertas/Contratos Gestores", loc: "https://inpronet.es/inproecoweb2_0/ofertas_gestores.php"},
                { path: BASEDIR+"/crm/transportistas", name: "Transportistas", loc: "https://inpronet.es/inproecoweb2_0/transportistas.php"},
                { path: BASEDIR+"/crm/contratos-transportistas", name: "Ofertas/Contratos Transportistas", loc: "https://inpronet.es/inproecoweb2_0/ofertas_transportistas.php"},
                { path: BASEDIR+"/crm/facturacion", name: "Facturación", loc: "https://inpronet.es/inproecoweb2_0/facturas.php"},
                { path: BASEDIR+"/crm/gestion-incidencias", name: "Gestión de incidencias", loc: "https://inpronet.es/inproecoweb2_0/incidencias_gestores.php"},
            ]
    },
        { path: BASEDIR+"/crm/gestores", component: Vendor, type: "child"},
        { path: BASEDIR+"/crm/ofertas-gestores", component: AddVendor, type: "child"},
        { path: BASEDIR+"/crm/transportistas", component: EditVendor, type: "child"},
        { path: BASEDIR+"/crm/contratos-transportistas", component: Vendor, type: "child"},
        { path: BASEDIR+"/crm/facturacion", component: AddVendor, type: "child"},
        { path: BASEDIR+"/crm/gestion-incidencias", component: EditVendor, type: "child"},

    { path: BASEDIR+"/crm/estadisticas", name: "Estadísticas", icon: "chart", badge: "", component: Crm, loc: "https://inpronet.es/inproecoweb2_0/estadisticas.php" }, */


    // { 
    //     path: "#", name: "Quotes", icon: "note", type: "dropdown", parentid: "quotes",
    //         child: [
    //             { path: BASEDIR+"/crm/quotes", name: "Quotes"},
    //             { path: BASEDIR+"/crm/add-quote", name: "Add Quote"},
    //             { path: BASEDIR+"/crm/edit-quote", name: "Edit Quote"},
    //         ]
    // },
    //     { path: BASEDIR+"/crm/quotes", component: Quote, type: "child"},
    //     { path: BASEDIR+"/crm/add-quote", component: AddQuote, type: "child"},
    //     { path: BASEDIR+"/crm/edit-quote", component: EditQuote, type: "child"},

    /* { 
        path: "#", name: "Control de Gastos", icon: "wallet", type: "dropdown", parentid: "invoices",
            child: [
                { path: BASEDIR+"/crm/gastos", name: "Desglose de gastos", loc: "https://inpronet.es/inproecoweb2_0/gastos_concepto.php"},
            ]
    },
        { path: BASEDIR+"/crm/gastos", component: Invoice, type: "child"}, */


    // { 
    //     path: "#", name: "Tickets", icon: "question", type: "dropdown", parentid: "tickets",
    //         child: [
    //             { path: BASEDIR+"/crm/tickets", name: "Tickets"},
    //             { path: BASEDIR+"/crm/add-ticket", name: "Add Ticket"},
    //             { path: BASEDIR+"/crm/edit-ticket", name: "Edit Ticket"},
    //         ]
    // },
    //     { path: BASEDIR+"/crm/tickets", component: Ticket, type: "child"},
    //     { path: BASEDIR+"/crm/add-ticket", component: AddTicket, type: "child"},
    //     { path: BASEDIR+"/crm/edit-ticket", component: EditTicket, type: "child"},


    // { 
    //     path: "#", name: "Contacts", icon: "phone", type: "dropdown", parentid: "contacts",
    //         child: [
    //             { path: BASEDIR+"/crm/contacts", name: "Contacts"},
    //             { path: BASEDIR+"/crm/add-contact", name: "Add Contact"},
    //             { path: BASEDIR+"/crm/edit-contact", name: "Edit Contact"},
    //         ]
    // },
    //     { path: BASEDIR+"/crm/contacts", component: Contact, type: "child"},
    //     { path: BASEDIR+"/crm/add-contact", component: AddContact, type: "child"},
    //     { path: BASEDIR+"/crm/edit-contact", component: EditContact, type: "child"},

    // { 
    //     path: "#", name: "Usuarios", icon: "user-female", type: "dropdown", parentid: "users",
    //         child: [
    //             { path: BASEDIR+"/crm/users", name: "Users"},
    //             { path: BASEDIR+"/crm/add-user", name: "Add User"},
    //             { path: BASEDIR+"/crm/edit-user", name: "Edit User"},
    //         ]
    // },
    //     { path: BASEDIR+"/crm/users", component: User, type: "child"},
    //     { path: BASEDIR+"/crm/add-user", component: AddUser, type: "child"},
    //     { path: BASEDIR+"/crm/edit-user", component: EditUser, type: "child"},
    /* { path: BASEDIR+"/crm/usuarios-nuevos", name: "Usuarios Nuevos", icon: "user-female", component: User},

    { path: "#", name: "Usuarios", icon: "user-female", type: "dropdown",
        child: [
            { path: BASEDIR+"/crm/usuarios", name: "Usuarios", loc: "https://inpronet.es/inproecoweb2_0/usuarios.php" }
        ]
    } */

    // { 
    //     path: "#", name: "Events", icon: "event", type: "dropdown", parentid: "events",
    //         child: [
    //             { path: BASEDIR+"/crm/events", name: "Events"},
    //             { path: BASEDIR+"/crm/addevent", name: "Add Event"},
    //         ]
    // },
    //     { path: BASEDIR+"/crm/events", component: CrmEvents, type: "child"},
    //     { path: BASEDIR+"/crm/addevent", component: AddEvent, type: "child"},

    // { 
    //     path: "#", name: "Mail Box", icon: "envelope", type: "dropdown", parentid: "mailbox",
    //     child: [
    //         { path: BASEDIR+"/crm/mail-inbox", name: "Mensajes"},
    //         { path: BASEDIR+"/crm/enviar-email", name: "Enviar email"},
    //         { path: BASEDIR+"/crm/notificaciones", name: "Notificaciones"},
    //     ]
    // },
    // { path: BASEDIR+"/crm/mail-inbox", component: CrmMailinbox, type: "child"},
    // { path: BASEDIR+"/crm/enviar-email", component: CrmMailcompose, type: "child"},
    // { path: BASEDIR+"/crm/notificaciones", component: CrmMailview, type: "child"},
    
    // { 
    //     path: "#", name: "Multi Purpose", icon: "layers", type: "dropdown", parentid: "multipurpose",
    //         child: [
    //             { path: BASEDIR+"/dashboard", name: "General"},
    //             { path: BASEDIR+"/hospital/dashboard", name: "Hospital"},
    //             { path: BASEDIR+"/music/dashboard", name: "Music"},
    //             { path: BASEDIR+"/crm/dashboard", name: "CRM"},
    //             { path: BASEDIR+"/social/dashboard", name: "Social Media"},
    //             { path: BASEDIR+"/freelance/dashboard", name: "Freelance"},
    //             { path: BASEDIR+"/university/dashboard", name: "University"},
    //             { path: BASEDIR+"/ecommerce/dashboard", name: "Ecommerce"},
    //             { path: BASEDIR+"/blog/dashboard", name: "Blog"},
    //         ]
    // },

    //     { path: BASEDIR+"/dashboard", component: General, type: "child"},
    //     { path: BASEDIR+"/hospital/dashboard", component: Hospital, type: "child"},
    //     { path: BASEDIR+"/music/dashboard", component: Music, type: "child"},
    //     { path: BASEDIR+"/crm/dashboard", component: Crm, type: "child"},
    //     { path: BASEDIR+"/social/dashboard", component: Social, type: "child"},
    //     { path: BASEDIR+"/freelance/dashboard", component: Freelance, type: "child"},
    //     { path: BASEDIR+"/university/dashboard", component: University, type: "child"},
    //     { path: BASEDIR+"/ecommerce/dashboard", component: Ecommerce, type: "child"},
    //     { path: BASEDIR+"/blog/dashboard", component: Blog, type: "child"},

    //{ redirect: true, path: BASEDIR+"/", pathTo: "/dashboard", name: "Dashboard" }

];
export default dashRoutes;
