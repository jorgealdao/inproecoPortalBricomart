import React, { useState, useEffect, useCallback } from 'react';
import Dropzone from 'react-dropzone'
import "./styles.css"
import {
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Container, Row, Col, Label, FormGroup, Input,
} from 'reactstrap';

//import ReactDOM from "react-dom";
//import "./styles.css";
import { client, getUsersList, getTotalCount, GET_RESIDUOS } from "../../../components/graphql";
import { gql } from "apollo-boost";

import {
    Plugin, Template, TemplateConnector, TemplatePlaceholder, Action,
} from '@devexpress/dx-react-core';
import {
    FilteringState,
    IntegratedFiltering,
    GroupingState,
    DataTypeProvider,
    EditingState,
    RowDetailState,
    PagingState,
    IntegratedPaging,
} from '@devexpress/dx-react-grid';
import {
    Grid,
    Table,
    TableHeaderRow,
    TableFilterRow,
    TableGroupRow,
    GroupingPanel,
    TableEditRow,
    TableEditColumn,
    PagingPanel,
    DragDropProvider,
    TableRowDetail,
    TableInlineCellEditing
} from '@devexpress/dx-react-grid-bootstrap4';
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';
const FILE_UPLOAD_MUTATION = gql`
  mutation ($name: String!, $type: String!, $base64str: String!) {
    fileUpload(name: $name, type: $type, base64str: $base64str) {
      file_path
    }
  }
`;
export default () => {
    const [fileNames, setFileNames] = useState([]);
    const [base64Str, setBase64Str] = useState(null);
    const [filepath, setFilePath] = useState(null);
    const fileUpload = (file, base64str) => {
        console.log(file)
      // make fetch api call to upload file
      const fileName = file.name;
      const fileType = file.type;
      const variables = { name: fileName, type: fileType, base64str: base64str };
      const url = 'http://localhost:8080/v1/graphql';
      const options = {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          query: FILE_UPLOAD_MUTATION,
          variables: variables
        })
      };

      client.mutate({
        mutation: FILE_UPLOAD_MUTATION,
        variables: variables});

    }
    const onDrop = useCallback(acceptedFiles => {
        
        setFileNames(acceptedFiles.map(file => file.name));
        for (let i=0; i<acceptedFiles.length; i++) {
            
            const reader = new FileReader();
            if (acceptedFiles[i]) {
            reader.readAsBinaryString(acceptedFiles[i]);
            }
            reader.onload = function () {
            const base64str = btoa(reader.result);
            setBase64Str(base64str);
            fileUpload(acceptedFiles[i], base64str);
            };
            reader.onerror = function () {
            console.log('Unable to parse file');
            };
            //e.preventDefault() // Stop form submit
        }
    }, [])


    return (
    //     <div className="App">
    //     <form onSubmit={onFormSubmit}>
    //       <h1>File Upload</h1>
    //       <input type="file" onChange={onChange} required />
    //       <button type="submit">Upload</button>
    //     </form>
    //     <div>{filepath ? <a href={`http://localhost:3000${filepath}`}>Open file</a> : null}</div>
    //   </div>
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
          <p>Drag'n'drop images, or click to select files</p>
        </div>
      );
    }}
  </Dropzone>
        <div>
        <strong>Files:</strong>
        <ul>
          {fileNames.map(fileName => (
            <li key={fileName}>{fileName}</li>
          ))}
        </ul>
      </div>
      </div>
    );
}
