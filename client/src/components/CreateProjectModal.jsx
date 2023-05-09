import { Modal, Button, Form, InputGroup, Row, Col } from "react-bootstrap";
import { useState } from "react";
import { ethers } from "ethers";

export default function CreateProjectModal(props) {
  const [name, setName] = useState(undefined);
  const [description, setDescription] = useState(undefined);
  const [target, setTarget] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);

  const { createProject, ...modalProps } = props;

  return (
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      {...modalProps}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Create a Project
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <InputGroup size="sm" as={Col} className="mb-3">
            <InputGroup.Text>Name</InputGroup.Text>
            <Form.Control
              onChange={(event) => setName(event.target.value)}
              aria-label="Project name"
            />
          </InputGroup>
        </Row>
        <Row className="mb-3">
          <InputGroup size="sm" as={Col} className="mb-3">
            <InputGroup.Text>Description</InputGroup.Text>
            <Form.Control
              as="textarea"
              onChange={(event) => setDescription(event.target.value)}
              style={{ minHeight: 100 }}
              aria-label="Project description"
            />
          </InputGroup>
        </Row>
        <Row className="mb-3">
          <InputGroup size="sm" as={Col} className="mb-3">
            <InputGroup.Text>Target</InputGroup.Text>
            <Form.Control
              onChange={(event) => setTarget(event.target.value)}
              type="number"
              aria-label="Project target"
              placeholder="ETH"
            />
          </InputGroup>
          <InputGroup size="sm" as={Col} className="mb-3">
            <InputGroup.Text size="sm">End Date</InputGroup.Text>
            <Form.Control
              onChange={(event) => setEndDate(event.target.valueAsNumber)}
              type="date"
              aria-label="Project end date"
            />
          </InputGroup>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => createProject(name, description, endDate, target)}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
