import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { InputGroup } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";

import { ethers } from "ethers";
import { useEffect, useState } from "react";

import ProgressBar from "react-bootstrap/ProgressBar";

export default function CardProject(props) {
  const ethTarget = ethers.formatEther(props.target);
  const ethBalance = ethers.formatEther(props.balance);

  const progress = Math.round((ethBalance / ethTarget) * 100);

  const [amount, setAmount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // components
  const [stateBadge, setStateBadge] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);

  useEffect(() => {
    if (props.account) {
      // chech if the current account is the owner of the project
      let account = props.account.toLowerCase();
      let owner = props.owner.toLowerCase();
      if (account === owner) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    }

    // set the project state
    if (props.state == "OPEN") {
      setStateBadge(<Badge bg="primary">open</Badge>);
    } else if (props.state == "OPEN_OBJ_REACHED") {
      setStateBadge(<Badge bg="success">open</Badge>);
    } else if (props.state == "CLOSED_OBJ_REACHED") {
      setStateBadge(<Badge bg="success">closed</Badge>);
      setIsClosed(true);
    } else if (props.state == "CLOSED_OBJ_FAILED") {
      setStateBadge(<Badge bg="danger">closed</Badge>);
      setIsClosed(true);
    }
    let endDate = new Date(props.endDate * 1000);
    setEndDate(endDate.toLocaleDateString());
  }, [props]);

  return (
    <Card bg="light" border="dark" className="h-100 d-flex flex-column shadow">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex flex-column flex-grow-1">
            <div className="d-flex">
              <small className="me-1">Owner:</small>
              <small className="fst-italic text-primary me-2">
                {props.owner.substring(1, 8) +
                  "..." +
                  props.owner.substring(
                    props.owner.length - 8,
                    props.owner.length
                  )}
              </small>
              <i
                role="button"
                onClick={() => navigator.clipboard.writeText(props.owner)}
                className="fa-duotone fa-copy"
                style={{ color: "var(--bs-primary)" }}
              />
            </div>
            <div className="d-flex">
              <small className="me-1">End date:</small>
              <small className="fst-italic text-primary me-2">{endDate}</small>
            </div>
          </div>
          <span>{stateBadge}</span>
        </div>
      </Card.Header>
      <Card.Img
        variant="middle"
        src={`https://picsum.photos/seed/${props.id}/640/480`}
        style={{ maxHeight: "175px", objectFit: "cover" }}
      />
      <Card.Body className="flex-grow-1 bg-white">
        <Card.Title className="fw-bold text-primary">{props.name}</Card.Title>
        <Card.Text className="flex-grow-1">{props.description}</Card.Text>
      </Card.Body>
      <Card.Footer className="flex-column align-items-center">
        <div className="d-flex w-100 align-items-center p-2 flex-grow-5">
          {!isClosed ? (
            progress >= 100 ? (
              <ProgressBar
                animated
                variant="success"
                className="me-2"
                style={{ height: 30, flexGrow: 5 }}
                now={progress}
                label={`${progress}%`}
              />
            ) : (
              <ProgressBar
                animated
                variant="warning"
                className="me-2"
                style={{ height: 30, flexGrow: 5 }}
                now={progress}
                label={`${progress}%`}
              />
            )
          ) : null}
          <div className="d-flex flex-fill flex-column" style={{ flexGrow: 1 }}>
            <div className="mx-auto">
              {progress >= 100 ? (
                <i
                  className="fa-duotone fa-flag"
                  style={{ color: "var(--bs-success)" }}
                ></i>
              ) : (
                <i
                  className="fa-duotone fa-flag"
                  style={{ color: "var(--bs-warning)" }}
                ></i>
              )}
            </div>
            <span className="mx-auto">
              {ethBalance}/{ethTarget} ETH
            </span>
          </div>
        </div>

        <div className="d-flex w-100 justify-content-around">
          {!isOwner ? (
            <>
              {props.contribution != 0 &&
              props.state != "CLOSED_OBJ_REACHED" ? (
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <div className="d-flex flex-column align-items-center">
                    <small className="text-break">You funded:</small>
                    <small className="fw-bold">
                      {ethers.formatEther(props.contribution)} ETH
                    </small>
                  </div>
                  <div className="d-flex">
                    <Button
                      onClick={() => props.withdraw(props.id, false)}
                      variant="warning"
                      size="sm"
                      className="text-light flex-grow-1"
                    >
                      <span>Withdraw</span>
                    </Button>
                    <Button
                      onClick={() => props.withdraw(props.id, true)}
                      variant="info"
                      size="sm"
                      className="text-light flex-grow-1"
                    >
                      <span>Fund</span>
                    </Button>
                  </div>
                </div>
              ) : null}
              {!isClosed ? (
                <div className="d-flex flex-column align-items-center py-3">
                  <InputGroup size="sm" className="mb-2 w-75">
                    <InputGroup.Text>ETH</InputGroup.Text>
                    <Form.Control
                      type="number"
                      aria-label="Amount in ETH"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </InputGroup>
                  <Button
                    className=""
                    onClick={() => props.fundProject(props.id, amount)}
                    size="sm"
                  >
                    <span>FundMeNow</span>
                  </Button>
                </div>
              ) : null}
            </>
          ) : !isClosed ? (
            <Button onClick={() => props.closeProject(props.id)} size="sm">
              Close project
            </Button>
          ) : null}
        </div>
      </Card.Footer>
    </Card>
  );
}
