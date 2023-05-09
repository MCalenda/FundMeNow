// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract CrowdFunding {
    enum State {
        OPEN, // Open for funding, objective not reached
        OPEN_OBJ_REACHED, // Open for funding, objective reached
        CLOSED_OBJ_REACHED, // Closed for funding, objective reached
        CLOSED_OBJ_FAILED // Closed for funding, objective not reached
    }

    address public owner;
    uint16 public projectCount = 0;
    mapping(uint16 => Project) public projects;
    mapping(uint16 => mapping(address => uint256)) public contributions;

    struct Project {
        uint16 id; // Unique ID of the project
        string name; // Name of the project
        string desc; // Description of the project
        address owner; // Address of the owner of the project
        uint256 endDate; // End date of the project (in seconds, UNIX timestamp)
        State state; // Current state of the project
        uint256 balance; // Funds reached to date (in wei)
        uint256 target; // Target of the project (in wei)
    }

    event ProjectCreated(uint16 _id);
    event ProjectFunded(uint16 _id);
    event ProjectReachedObjective(uint16 _id);
    event ProjectClosed(uint16 _id);

    constructor() {
        owner = msg.sender;
        createProject(
            "Progetto di beneficenza",
            "Raccolta fondi per la costruzione di un pozzo d'acqua in un villaggio rurale in Africa"
            "per fornire acqua pulita e sicura alle famiglie e migliorare la loro qualita di vita.",
            1692007200,
            15000000000000000000
        );
        createProject(
            "Finanzia il mio viaggio!",
            "Sto cercando dei fondi per un viaggio fotografico per documentare la cultura e la vita quotidiana "
            "dei popoli indigeni delle Ande, con l'obiettivo di sensibilizzare il pubblico sulla loro "
            "storia e le loro tradizioni.",
            1692307248,
            5000000000000000000
        );
    }

    modifier OnlyOwner(uint16 _id) {
        require(
            msg.sender == projects[_id].owner,
            "Only owner can do this operation."
        );
        _;
    }

    modifier ProjectExists(uint16 _id) {
        require(_id > 0 && _id <= projectCount, "Project does not exist.");
        _;
    }

    modifier OnlyContributors(uint16 _id) {
        require(
            contributions[_id][msg.sender] > 0,
            "Only contributors can do this operation."
        );
        _;
    }

    // Functionalities

    function createProject(
        string memory _name,
        string memory _desc,
        uint256 _endDate,
        uint256 _target
    ) public {
        // Require a valid name, target, endDate
        require(bytes(_name).length > 0);
        require(_target > 0);
        require(_endDate > block.timestamp + 14 days);

        projectCount++;
        projects[projectCount] = Project(
            projectCount,
            _name,
            _desc,
            msg.sender,
            _endDate,
            State.OPEN,
            0,
            _target
        );

        emit ProjectCreated(projectCount);
    }

    function fundProject(uint16 _id) public payable ProjectExists(_id) {
        require(msg.value > 0);
        Project memory _project = projects[_id];
        address _owner = _project.owner;

        // Check if the project is open for funding
        require(
            (_project.state != State.CLOSED_OBJ_REACHED) &&
                (_project.state != State.CLOSED_OBJ_FAILED),
            "Project is closed."
        );

        // Check if the owner is trying to fund and reject it
        require(
            _owner != msg.sender,
            "Owner can't fund the project created by themselves."
        );

        // Check if the project is expired
        if (block.timestamp >= _project.endDate) {
            if (_project.balance >= _project.target) {
                _project.state = State.CLOSED_OBJ_REACHED;
            } else {
                _project.state = State.CLOSED_OBJ_FAILED;
            }
            emit ProjectClosed(_id);
            revert("Project has expired.");
        }

        _project.balance += msg.value;
        if (_project.balance >= _project.target) {
            _project.state = State.OPEN_OBJ_REACHED;
            emit ProjectReachedObjective(_project.id);
        }
        projects[_id] = _project;
        contributions[_id][msg.sender] += msg.value;
    }

    function closeProject(uint16 _id) public OnlyOwner(_id) ProjectExists(_id) {
        Project memory _project = projects[_id];

        // Check if the project is already closed
        require(
            (_project.state != State.CLOSED_OBJ_FAILED) &&
                (_project.state != State.CLOSED_OBJ_REACHED),
            "Project is already closed."
        );

        if (_project.state == State.OPEN_OBJ_REACHED) {
            payable(_project.owner).transfer(_project.balance);
            _project.state = State.CLOSED_OBJ_REACHED;
        } else {
            _project.state = State.CLOSED_OBJ_FAILED;
        }

        projects[_id] = _project;
        emit ProjectClosed(_project.id);
    }

    function withdraw(
        uint16 _id,
        bool stillFund
    ) public OnlyContributors(_id) ProjectExists(_id) {
        Project memory _project = projects[_id];

        require(
            _project.state != State.CLOSED_OBJ_REACHED,
            "Project objective is reached."
        );

        // Check if the project is closed and objective is not reached
        require(
            (_project.state != State.OPEN) &&
                (_project.state != State.OPEN_OBJ_REACHED),
            "Project is not closed."
        );

        uint256 contribution = contributions[_id][msg.sender];
        contributions[_id][msg.sender] = 0;
        if (stillFund) {
            payable(_project.owner).transfer(contribution);
        } else {
            payable(msg.sender).transfer(contribution);
            _project.balance -= contribution;
        }

        projects[_id] = _project;
    }

    // Project getters in string form
    function getProjectId(
        uint16 _id
    ) public view ProjectExists(_id) returns (string memory) {
        return Strings.toString(projects[_id].id);
    }

    function getProjectName(
        uint16 _id
    ) public view ProjectExists(_id) returns (string memory) {
        return projects[_id].name;
    }

    function getProjectDescription(
        uint16 _id
    ) public view ProjectExists(_id) returns (string memory) {
        return projects[_id].desc;
    }

    function getProjectEndDate(
        uint16 _id
    ) public view ProjectExists(_id) returns (string memory) {
        return Strings.toString(projects[_id].endDate);
    }

    function getProjectTarget(
        uint16 _id
    ) public view ProjectExists(_id) returns (string memory) {
        return Strings.toString(projects[_id].target);
    }

    function getProjectBalance(
        uint16 _id
    ) public view ProjectExists(_id) returns (string memory) {
        return Strings.toString(projects[_id].balance);
    }

    function getProjectState(
        uint16 _id
    ) public view ProjectExists(_id) returns (string memory) {
        if (projects[_id].state == State.OPEN) {
            return "OPEN";
        } else if (projects[_id].state == State.OPEN_OBJ_REACHED) {
            return "OPEN_OBJ_REACHED";
        } else if (projects[_id].state == State.CLOSED_OBJ_REACHED) {
            return "CLOSED_OBJ_REACHED";
        } else {
            return "CLOSED_OBJ_FAILED";
        }
    }

    function getProjectOwner(
        uint16 _id
    ) public view ProjectExists(_id) returns (address) {
        return projects[_id].owner;
    }

    function getProjectContributions(
        uint16 _id
    ) public view ProjectExists(_id) returns (string memory) {
        return Strings.toString(contributions[_id][msg.sender]);
    }

    function getProjectContributors(
        uint16 _id
    ) public view ProjectExists(_id) returns (address[] memory) {
        address[] memory _contributors = new address[](projectCount);
        for (uint16 i = 1; i <= projectCount; i++) {
            _contributors[i - 1] = projects[i].owner;
        }
        return _contributors;
    }

    function getProject(
        uint16 _id
    ) public view ProjectExists(_id) returns (Project memory) {
        return projects[_id];
    }

    function getProjectReadable(
        uint16 _id
    ) public view ProjectExists(_id) returns (string[] memory) {
        string[] memory _project = new string[](7);
        _project[0] = getProjectId(_id);
        _project[1] = getProjectName(_id);
        _project[2] = getProjectDescription(_id);
        _project[3] = getProjectEndDate(_id);
        _project[4] = getProjectTarget(_id);
        _project[5] = getProjectBalance(_id);
        _project[6] = getProjectState(_id);
        return _project;
    }

    function getAllProjects() public view returns (Project[] memory) {
        Project[] memory _projects = new Project[](projectCount);
        for (uint16 i = 1; i <= projectCount; i++) {
            _projects[i - 1] = projects[i];
        }
        return _projects;
    }
}
