import React, { useState, useEffect } from 'react';

import {
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Container, Row, Col, Label, FormGroup, Input,
} from 'reactstrap';

//import ReactDOM from "react-dom";
//import "./styles.css";
import { client, getUsersList, getTotalCount, GET_RESIDUOS } from "../../../components/graphql";
import { gql } from "apollo-boost";
import { DetailContent, DetailEditCell, DetailCell } from "./DetailContent";

import classNames from 'clsx';

import {
    FilteringState,
    IntegratedFiltering,
    EditingState,
    RowDetailState,
    PagingState,
    IntegratedPaging,
    IntegratedSorting,
    SortingState
} from '@devexpress/dx-react-grid';
import {
    Grid,
    Table,
    TableHeaderRow,
    TableFilterRow,
    PagingPanel,
    DragDropProvider,
    TableRowDetail,
    TableInlineCellEditing
} from '@devexpress/dx-react-grid-bootstrap4';
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';

const getRowId = row => row.id;

const filterRowMessages = {
    filterPlaceholder: 'Filtrar...',
};

const ToggleCell = ({
    expanded, onToggle,
    tableColumn, tableRow, row, style,
    ...restProps
}) => {
    console.log(onToggle)
    const handleClick = (e) => {
        e.preventDefault();
        onToggle();
    };
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
        </td>
    );
};

export default () => {
    const remoteData = (query) => {
        return client.query({
            query: getUsersList,
            variables: {
                offset: 0,
                limit: 10
            }
        }).then((res) => {
            let results = []
            for (let i = 0; i < res.data.getRetiradasView.length; i++) {
                res.data.getRetiradasView[i].id = res.data.getRetiradasView[i].ID;
                results.push(res.data.getRetiradasView[i])
            }

            setRows(results)
        })
    }
    const [columns] = useState([
        { name: "ID", title: "id" },
        { name: "CENTRO", title: "Centro" },
        { name: "RESIDUO", title: "Residuo" },
        { name: "CLIENTE", title: "Cliente" },
        { name: "CANTIDAD", title: "Cantidad" },
        { name: "OBSERVACIONES", title: "Observaciones" },
        { name: "TRANSPORTISTA", title: "Transportista" },
    ]);

    const [rows, setRows] = useState(null);
    const [expandedRows, setExpandedRows] = useState([]);

    useEffect(() => {
        remoteData("test")
    }, [])
    const commitChanges = ({ added, changed, deleted }) => {
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
            // updateTodo({ variables: {id, OBSERVACIONES: input.value } });
            changedRows = rows.map(row => {
                if (changed[row.id]) {
                    id = row.id;
                    return { ...row, ...changed[row.id] }
                } else {
                    return row;
                }
            });

            if (id && changed[id]) {
                console.log(changed)
                const fields = Object.keys(changed[id]);
                for (let i = 0; i < fields.length; i++) {

                    let field = fields[i];
                    /* SEND MUTATION AND UPDATE THE CACHE MANUALLY */
                    let variables = {}
                    variables.ID = id.toString();
                    variables[field] = changed[id][field]
                    console.log(variables)

                    client.mutate({
                        mutation: gql`
                            mutation MyMutation($${field}: String = "", $ID: String = "") {
                                updateRetirada(RETIRADA: {${field}: $${field}}, where: {ID: $ID}) {
                                ID
                                ${field}
                                }
                            }
                            `,
                        variables: variables,
                        update: (cache, { data }) => {
                            try {
                                /* BECAUSE WE ARE UPDATING A DIFFERENT COLLECTION WE NEED TO UPDATE THE CACHE MANUALLY */
                                let { getRetiradasView } = cache.readQuery({
                                    query: getUsersList, variables: {
                                        offset: 0,
                                        limit: 10
                                    }
                                });
                                const retiradas = getRetiradasView.map((retirada) => {
                                    if (retirada.ID == data.updateRetirada.ID) {
                                        retirada[field] = data.updateRetirada[field]
                                        return retirada
                                    }
                                    return retirada
                                })
                                cache.writeQuery({
                                    query: getUsersList,
                                    data: {
                                        'getRetiradasView': retiradas
                                    }
                                });
                            } catch (e) {
                                console.log(e)
                                // We should always catch here,
                                // as the cache may be empty or the query may fail
                            }
                        }
                    })
                }
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
        <div>
            <div className="content">
                <Row>
                    <Col xs={12} md={12}>

                        <div className="page-title">
                            <div className="float-left">
                                <h1 className="title">Servicios Leroy Materiales</h1>
                            </div>
                        </div>
                        <div className="col-12">
                            <section className="box ">
                                <header className="panel_header">
                                    <h2 className="title float-left">Servicios Leroy Materiales - Edición</h2>

                                </header>
                                <div className="content-body">
                                    <div className="row">
                                        <div className="col-lg-12 card">
                                            <Grid
                                                rows={rows}
                                                columns={columns}
                                                getRowId={getRowId}
                                            >
                                                <FilteringState defaultFilters={[]} />

                                                {/* <EditingState
                                                    onCommitChanges={commitChanges}
                                                /> */}
                                                <RowDetailState
                                                    expandedRowIds={expandedRows}
                                                />
                                                <EditingState
                                                    defaultEditingRowIds={[1]}
                                                    onCommitChanges={commitChanges}
                                                />
                                                <IntegratedFiltering />
                                                <PagingState
                                                    defaultCurrentPage={0}
                                                    defaultPageSize={5}
                                                />
                                                <IntegratedPaging />
                                                <SortingState
                                                defaultSorting={[{ columnName: 'ID', direction: 'asc' }]}
                                                />
                                                <IntegratedSorting />
                                                <Table rowComponent={({ children, row }) => (
                                                    <tr
                                                    onClick={(e) => {
                                                        console.log(expandedRows)
                                                        if(expandedRows.includes(row.id)) { // Cerramos el actual
                                                            setExpandedRows([]);
                                                        } else {                                                       
                                                            setExpandedRows([row.id]);  
                                                        }
                                                    }}
                                                    >
                                                    {children}
                                                    </tr>
                                                )} />
                                                <TableHeaderRow showSortingControls/>
                                                <TableRowDetail
                                                    contentComponent={DetailContent}
                                                    cellComponent={DetailCell}
                                                    toggleCellComponent={ToggleCell}
                                                />
                                                <DetailEditCell />
                                                {/* <TableInlineCellEditing /> */}


                                                <TableFilterRow
                                                    messages={filterRowMessages}
                                                />
                                                <PagingPanel
                                                    pageSizes={[10, 25, 50]}
                                                />
                                            </Grid>
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
