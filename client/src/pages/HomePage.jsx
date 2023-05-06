import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { abi } from "../abi/CrowdFunding";

import CardProject from "../components/CardProject";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";

export default function HomePage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [account, setAccount] = useState("");
  const [connButtonText, setConnButtonText] = useState("Connect Account");
  const [projects, setProjects] = useState([]);

  // create project modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const address = "0x4c51C686CBE79e26B8Cc93b04BF0f530E7B0a872";

  // Sets up a new Ethereum provider and returns
  // an interface for interacting with the smart contract
  async function initializeProvider() {
    if (window.ethereum == null) {
      setErrorMessage("No MetaMask detected, using default provider");
      const provider = ethers.getDefaultProvider();
    } else {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(address, abi, signer);
    }
  }

  // Displays a prompt for the user to select which accounts to connect
  async function requestAccount() {
    setAccount("");
    const account = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (account != "") {
      setConnButtonText("Connected");
      setAccount(account[0]);
    } else {
      setConnButtonText("Connect Account");
      setErrorMessage("Please connect an account to continue");
    }
  }

  async function fetchProjects() {
    if (typeof window.ethereum !== "undefined") {
      const contract = await initializeProvider();
      try {
        const projectCount = parseInt(await contract.projectCount());
        let _projects = [];
        for (let i = 1; i < projectCount + 1; i++) {
          const _project = {
            id: await contract.getProjectId(i),
            name: await contract.getProjectName(i),
            description: await contract.getProjectDescription(i),
            endDate: await contract.getProjectEndDate(i),
            target: await contract.getProjectTarget(i),
            balance: await contract.getProjectBalance(i),
            state: await contract.getProjectState(i),
          };
          _projects.push(_project);
        }
        setProjects(_projects);
      } catch (err) {
        console.log(err.message);
      }
    }
  }

  async function createProject() {
    if (typeof window.ethereum !== "undefined") {
      const contract = await initializeProvider();
      try {
        const tx = await contract.createProject(
          "New Project",
          "This is a new project",
          1895007200,
          ethers.parseEther("20")
        );
        await tx.wait();
        fetchProjects();
      } catch (err) {
        console.log(err.message);
      }
    }
  }

  useEffect(() => {
    if (account) {
      fetchProjects();
    } else {
      requestAccount();
      setProjects([]);
    }
  }, [account]);

  // reload page if chain changes
  const chainChangedHandler = () => {
    window.location.reload();
  };

  // listen for changes
  window.ethereum.on("accountsChanged", requestAccount);
  window.ethereum.on("chainChanged", chainChangedHandler);

  return (
    <Container>
      <button onClick={requestAccount}>{connButtonText}</button>
      <button onClick={handleShow}>Create Project</button>
      <h1>{account}</h1>
      <h2>{errorMessage}</h2>
      <Container>
        <Row>
          {projects.map((project) => (
            <Col sm="6">
              <CardProject key={project.id} project={project} />
            </Col>
          ))}
        </Row>
      </Container>

      <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export const projLoader = async () => {
  return null;
};
