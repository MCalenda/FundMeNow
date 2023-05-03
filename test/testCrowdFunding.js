const tassert = require("truffle-assertions");
const CrowdFunding = artifacts.require("CrowdFunding");

contract("CrowdFunding", (accounts) => {
  // accounts
  let deployer = accounts[0];
  let account1 = accounts[1];
  let account2 = accounts[2];
  let account3 = accounts[3];

  // Smart contract instance
  let crowdFunding;
  let crowdFundingOwner;
  let address;

  // dummy projects Ids
  let open;
  let openObjReached;
  let closedObjReached;
  let closedObjFailed;

  beforeEach(async () => {
    crowdFunding = await CrowdFunding.new();
    crowdFundingOwner = await crowdFunding.owner();
    address = crowdFunding.address;

    // get the timestamp in seconds
    timestamp = Math.floor(new Date().getTime() / 1000);

    // create dummy projects
    // open project
    await crowdFunding.createProject(
      "dummy-open-project-name",
      "dummy-open-project-description",
      timestamp + 1.296e6, // 15 days in seconds
      web3.utils.toWei("2", "Ether"),
      { from: account1 }
    );
    open = await crowdFunding.projectCount();

    // open project with objective reached
    await crowdFunding.createProject(
      "dummy-open-project-objective-reached-name",
      "dummy-open-project-objective-reached-description",
      timestamp + 1.296e6, // 15 days in seconds
      web3.utils.toWei("4", "Ether"),
      { from: account1 }
    );
    openObjReached = await crowdFunding.projectCount();
    await crowdFunding.fundProject(openObjReached, {
      from: account2,
      value: web3.utils.toWei("5", "Ether"),
    });

    // closed project with objective reached
    await crowdFunding.createProject(
      "dummy-closed-project-objective-reached-name",
      "dummy-closed-project-objective-reached-description",
      timestamp + 1.296e6, // 15 days in seconds
      web3.utils.toWei("1", "Ether"),
      { from: account2 }
    );
    closedObjReached = await crowdFunding.projectCount();
    await crowdFunding.fundProject(closedObjReached, {
      from: account3,
      value: web3.utils.toWei("1", "Ether"),
    });
    await crowdFunding.closeProject(closedObjReached, {
      from: account2,
    });

    // closed project with objective not reached
    await crowdFunding.createProject(
      "dummy-closed-project-objective-failed-name",
      "dummy-closed-project-objective-failed-description",
      timestamp + 1.296e6, // 15 days in seconds
      web3.utils.toWei("5", "Ether"),
      { from: account3 }
    );
    closedObjFailed = await crowdFunding.projectCount();
    await crowdFunding.closeProject(closedObjFailed, {
      from: account3,
    });
  });

  it("deploys successfully", async () => {
    assert.equal(crowdFundingOwner, deployer, "Owner is not correct.");
    assert.notEqual(address, 0x0, "Address is not correct.");
    assert.notEqual(address, "", "Address is not correct.");
    assert.notEqual(address, null, "Address is not correct.");
    assert.notEqual(address, undefined, "Address is not correct.");
  });

  it("creates a project", async () => {
    let lastProjectId = await crowdFunding.projectCount();

    // get the timestamp in seconds
    timestamp = Math.floor(new Date().getTime() / 1000);

    await crowdFunding.createProject(
      "test-creation-project-name",
      "test-creation-project-description",
      timestamp + 1.296e6, // 15 days in seconds
      web3.utils.toWei("5", "Ether"),
      { from: account1 }
    );

    let projectCreatedId = await crowdFunding.projectCount();
    assert.equal(
      projectCreatedId.toNumber(),
      lastProjectId.toNumber() + 1,
      "The project count after a project creation is not correct."
    );

    project = await crowdFunding.getProject(projectCreatedId);

    assert.equal(
      project.owner,
      account1,
      "Owner of the created project is not correct."
    );
    assert.equal(
      project.id,
      projectCreatedId,
      "Id of the created project is not correct."
    );
    assert.equal(
      project.name,
      "test-creation-project-name",
      "Name of the created project is not correct."
    );
    assert.equal(
      project.desc,
      "test-creation-project-description",
      "Description of the created project is not correct."
    );
    assert.equal(
      project.endDate,
      timestamp + 1.296e6,
      "End date of the created project is not correct."
    );
    assert.equal(
      project.target,
      web3.utils.toWei("5", "Ether"),
      "The target of the created project is not correct."
    );
    assert.equal(
      project.balance,
      0,
      "The balance of the created project is not correct."
    );
  });

  it("funds a project", async () => {
    await crowdFunding.fundProject(open, {
      from: account2,
      value: web3.utils.toWei("1", "Ether"),
    });

    project = await crowdFunding.getProject(open);
    assert.equal(
      project.balance,
      web3.utils.toWei("1", "Ether"),
      "After funding, the balance of the project is not correct."
    );

    await tassert.reverts(
      crowdFunding.fundProject(open, {
        from: account1,
        value: web3.utils.toWei("1", "Ether"),
      }),
      "Owner can't fund the project created by themselves.",
      "Users can fund their own projects."
    );

    await tassert.reverts(
      crowdFunding.fundProject(closedObjFailed, {
        from: account2,
        value: web3.utils.toWei("1", "Ether"),
      }),
      "Project is closed.",
      "Users can fund a closed project."
    );

    await tassert.reverts(
      crowdFunding.fundProject(closedObjReached, {
        from: account2,
        value: web3.utils.toWei("1", "Ether"),
      }),
      "Project is closed.",
      "Users can fund a closed project."
    );
  });

  it("closes a project", async () => {
    await tassert.reverts(
      crowdFunding.closeProject(open, {
        from: account2,
      }),
      "Only owner can do this operation.",
      "Users can close not their own projects."
    );

    await crowdFunding.closeProject(open, {
      from: account1,
    });
    let projectOpen = await crowdFunding.getProject(open);
    assert.equal(
      projectOpen.state,
      3, // CLOSED_OBJ_FAILED
      "The project has not been correctly closed."
    );

    await crowdFunding.closeProject(openObjReached, {
      from: account1,
    });
    let projectOpenObjReached = await crowdFunding.getProject(openObjReached);
    assert.equal(
      projectOpenObjReached.state,
      2, // CLOSED_OBJ_REACHED
      "The project has not been correctly closed."
    );

    await tassert.reverts(
      crowdFunding.closeProject(closedObjReached, {
        from: account2,
      }),
      "Project is already closed.",
      "Users can close an already closed project."
    );

    await tassert.reverts(
      crowdFunding.closeProject(closedObjFailed, {
        from: account3,
      }),
      "Project is already closed.",
      "Users can close an already closed project."
    );

  });

  it("withdraws", async () => {
    
    
  });

});
