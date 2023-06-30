import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { abi } from "../abi/CrowdFunding";

import CardProject from "../components/CardProject";

import { Container, Row, Col, Button, Toast } from "react-bootstrap";

import CreateProjectModal from "../components/CreateProjectModal";
import Header from "../components/Header";

export default function HomePage() {
  const [currentAccount, setCurrentAccount] = useState(undefined);
  const [projects, setProjects] = useState([]);

  // create project modal
  const [createProjectVisible, setCreateProjectVisible] = useState(false);
  const showCreateProject = () => setCreateProjectVisible(true);
  const hideCreateProject = () => setCreateProjectVisible(false);

  // error message
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const showErrorMessage = () => setErrorMessageVisible(true);
  const hideErrorMessage = () => setErrorMessageVisible(false);
  const [errorMessage, setErrorMessage] = useState(undefined);

  const address = "0xCfEB869F69431e42cdB54A4F4f105C19C080A601";

  // Sets up a new Ethereum provider and returns
  // an interface for interacting with the smart contract
  async function initializeProvider() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(address, abi, signer);
    } else {
      showErrorMessage();
      setErrorMessage("No MetaMask detected");
    }
  }

  // Displays a prompt for the user to select which accounts to connect
  async function requestAccount() {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      // pending connection
      if (error.code == -32002) {
        showErrorMessage();
        setErrorMessage("Connection in pending, check your MetaMask extension");
      }
      // user rejected connection
      if (error.code == 4001) {
        showErrorMessage();
        setErrorMessage("Connection rejected");
      }
    }
  }

  async function fetchProjects() {
    const contract = await initializeProvider();
    try {
      const projectCount = parseInt(await contract.projectCount());
      let _projects = [];
      for (let i = 1; i < projectCount + 1; i++) {
        const project = {
          id: await contract.getProjectId(i),
          name: await contract.getProjectName(i),
          description: await contract.getProjectDescription(i),
          endDate: await contract.getProjectEndDate(i),
          target: await contract.getProjectTarget(i),
          balance: await contract.getProjectBalance(i),
          state: await contract.getProjectState(i),
          owner: await contract.getProjectOwner(i),
          contribution: await contract.getProjectContributions(i),
        };
        _projects.push(project);
      }
      setProjects(_projects);
    } catch (err) {
      showErrorMessage();
      setErrorMessage("Fetching project failed");
    }
  }

  async function handleCreateProject(_name, _description, _endDate, _target) {
    const contract = await initializeProvider();
    let ethersToWei = ethers.parseUnits(_target.toString(), "ether");
    try {
      const tx = await contract.createProject(
        _name,
        _description,
        _endDate / 1000,
        ethersToWei
      );
      await tx.wait();
      fetchProjects();
      hideCreateProject();
    } catch (err) {
      console.log(err.message);
    }
  }

  async function handleFundProject(_projectId, _amount) {
    let ethersToWei = ethers.parseUnits(_amount.toString(), "ether");
    const contract = await initializeProvider();
    try {
      const tx = await contract.fundProject(_projectId, {
        value: ethersToWei,
      });
      await tx.wait();
      fetchProjects();
    } catch (err) {
      console.log(err.message);
    }
  }

  async function handleCloseProject(_projectId) {
    const contract = await initializeProvider();
    try {
      const tx = await contract.closeProject(_projectId);
      await tx.wait();
      fetchProjects();
    } catch (err) {
      console.log(err.message);
    }
  }

  async function handleWithdraw(_projectId, _stillFund) {
    const contract = await initializeProvider();
    try {
      const tx = await contract.withdraw(_projectId, _stillFund);
      await tx.wait();
      fetchProjects();
    } catch (err) {
      console.log(err.message);
    }
  }

  async function handleAccountChanged() {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length == 0) {
        setCurrentAccount(undefined);
      } else {
        setCurrentAccount(accounts[0]);
      }
    } catch (error) {
      // pending connection
      if (error.code == -32002) {
        showErrorMessage();
        setErrorMessage("Connection in pending, check your MetaMask extension");
      }
      // user rejected connection
      if (error.code == 4001) {
        showErrorMessage();
        setErrorMessage("Connection rejected");
      }
    }
  }

  useEffect(() => {
    handleAccountChanged();
    if (currentAccount) {
      fetchProjects();
    } else if (projects.length > 0) {
      setProjects([]);
    }
  }, [currentAccount]);

  window.ethereum.on("accountsChanged", handleAccountChanged);
  window.ethereum.on("chainChanged", handleAccountChanged);

  return (
    <>
      <Toast
        className="position-absolute bottom-0 start-50 translate-middle-x mb-5"
        show={errorMessageVisible}
        onClose={hideErrorMessage}
        style={{ zIndex: 1 }}
      >
        <Toast.Header>
          <strong className="me-auto text-warning">Warning</strong>
        </Toast.Header>
        <Toast.Body>{errorMessage}</Toast.Body>
      </Toast>

      {!currentAccount ? (
        <div className="d-flex flex-column justify-content-center align-items-center bg-dark text-light vh-100">
          <h1 className="text-center">Welcome to FundMeNow</h1>
          <p className="text-center">
            To use this app, you need to connect your MetaMask account
          </p>
          <Button className="mt-5 w-25" onClick={requestAccount}>
            connect
          </Button>
        </div>
      ) : (
        <>
          <Header
            currentAccount={currentAccount}
            showCreateProject={showCreateProject}
            style={{ zIndex: 0 }}
          />
          <Container>
            <CreateProjectModal
              show={createProjectVisible}
              onHide={hideCreateProject}
              backdrop="static"
              keyboard={false}
              createProject={handleCreateProject}
            />

            <Container className="pt-4">
              <Row>
                {projects.map((project) => (
                  <Col className="p-3" xxl="4" xl="6" md="12">
                    <CardProject
                      key={project.id}
                      {...project}
                      fundProject={handleFundProject}
                      closeProject={handleCloseProject}
                      withdraw={handleWithdraw}
                      account={currentAccount}
                    />
                  </Col>
                ))}
              </Row>
            </Container>
          </Container>
        </>
      )}
    </>
  );
}

export const projLoader = async () => {
  return null;
};
