import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DataQualityDetails = ({ show, handleClose, dataQualityReport }) => {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Data Quality Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Environment Variables:</h5>
                <pre>{JSON.stringify(dataQualityReport.environmentVariables, null, 2)}</pre>

                <h5>Data Source Status:</h5>
                <ul>
                    {dataQualityReport.dataSources.map((source, index) => (
                        <li key={index}>{source.name}: {source.status}</li>
                    ))}
                </ul>

                <h5>Fallback Data in Use:</h5>
                <pre>{JSON.stringify(dataQualityReport.fallbackData, null, 2)}</pre>

                <h5>Options Data Type:</h5>
                <p>{dataQualityReport.optionsDataType}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DataQualityDetails;