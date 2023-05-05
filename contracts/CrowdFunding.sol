// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

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

    event ProjectCreated(uint16 id);
    event ProjectFunded(uint16 id);
    event ProjectReachedObjective(uint16 id);
    event ProjectClosed(uint16 id);

    constructor() {
        owner = msg.sender;
        createProject("Prova", "Questo e' un progetto di prova", 1692007200 , 10000000000000000000);
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
            _project.balance = 0;
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
        _project.balance -= contribution;
        contributions[_id][msg.sender] = 0;
        projects[_id] = _project;

        stillFund
            ? payable(_project.owner).transfer(contribution)
            : payable(msg.sender).transfer(contribution);
    }

    function getProject(
        uint16 _id
    ) public view ProjectExists(_id) returns (Project memory) {
        return projects[_id];
    }

    function getAllProjects() public view returns (Project[] memory) {
        Project[] memory _projects = new Project[](projectCount);
        for (uint16 i = 1; i <= projectCount; i++) {
            _projects[i - 1] = projects[i];
        }
        return _projects;
    }
}
