const tassert = require("truffle-assertions");
const CrowdFunding = artifacts.require("CrowdFunding");

contract("CrowdFunding", (accounts) => {
  // CrowdFunding instance
  let cf;
  let cfOwner;
  let cfAddress;

  // dummy accounts
  let deployer = accounts[0];
  let account1 = accounts[1];
  let account2 = accounts[2];
  let account3 = accounts[3];

  // dummy projects Ids
  let open;
  let openObjReached;
  let closedObjReached;
  let closedObjFailed;

  // timestamp
  let ts;

  beforeEach(async () => {
    cf = await CrowdFunding.new();
    cfOwner = await cf.owner();
    cfAddress = cf.address;

    // get the timestamp in seconds
    ts = Math.floor(new Date().getTime() / 1000);

    // create dummy projects
    // open project
    await cf.createProject(
      "dummy-open-project-name",
      "dummy-open-project-description",
      ts + 1.296e6, // 15 days in seconds
      web3.utils.toWei("2", "Ether"),
      { from: account1 }
    );
    open = await cf.projectCount();

    // open project with objective reached
    await cf.createProject(
      "dummy-open-project-objective-reached-name",
      "dummy-open-project-objective-reached-description",
      ts + 1.296e6, // 15 days in seconds
      web3.utils.toWei("4", "Ether"),
      { from: account1 }
    );
    openObjReached = await cf.projectCount();
    await cf.fundProject(openObjReached, {
      from: account2,
      value: web3.utils.toWei("5", "Ether"),
    });

    // closed project with objective reached
    await cf.createProject(
      "dummy-closed-project-objective-reached-name",
      "dummy-closed-project-objective-reached-description",
      ts + 1.296e6, // 15 days in seconds
      web3.utils.toWei("1", "Ether"),
      { from: account2 }
    );
    closedObjReached = await cf.projectCount();
    await cf.fundProject(closedObjReached, {
      from: account3,
      value: web3.utils.toWei("1", "Ether"),
    });
    await cf.closeProject(closedObjReached, {
      from: account2,
    });

    // closed project with objective not reached
    await cf.createProject(
      "dummy-closed-project-objective-failed-name",
      "dummy-closed-project-objective-failed-description",
      ts + 1.296e6, // 15 days in seconds
      web3.utils.toWei("5", "Ether"),
      { from: account3 }
    );
    closedObjFailed = await cf.projectCount();
    await cf.fundProject(closedObjFailed, {
      from: account2,
      value: web3.utils.toWei("1", "Ether"),
    });
    await cf.closeProject(closedObjFailed, {
      from: account3,
    });
  });

  it("deploys crowdfunding successfully", async () => {
    assert.equal(cfOwner, deployer, "Owner is not correct.");
    assert.notEqual(cfAddress, 0x0, "Address is not correct.");
    assert.notEqual(cfAddress, "", "Address is not correct.");
    assert.notEqual(cfAddress, null, "Address is not correct.");
    assert.notEqual(cfAddress, undefined, "Address is not correct.");
  });

  it("creates a project", async () => {
    let lastProjectId = await cf.projectCount();

    await cf.createProject(
      "test-creation-project-name",
      "test-creation-project-description",
      ts + 1.296e6, // 15 days in seconds
      web3.utils.toWei("5", "Ether"),
      { from: account1 }
    );

    let projectCreatedId = await cf.projectCount();
    assert.equal(
      projectCreatedId.toNumber(),
      lastProjectId.toNumber() + 1,
      "The project count after a project creation is not correct."
    );

    project = await cf.getProject(projectCreatedId);

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
      ts + 1.296e6,
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
    await cf.fundProject(open, {
      from: account2,
      value: web3.utils.toWei("1", "Ether"),
    });

    project = await cf.getProject(open);
    assert.equal(
      project.balance,
      web3.utils.toWei("1", "Ether"),
      "After funding, the balance of the project is not correct."
    );

    await tassert.reverts(
      cf.fundProject(open, {
        from: account1,
        value: web3.utils.toWei("1", "Ether"),
      }),
      "Owner can't fund the project created by themselves.",
      "Users can fund their own projects."
    );

    await tassert.reverts(
      cf.fundProject(closedObjFailed, {
        from: account2,
        value: web3.utils.toWei("1", "Ether"),
      }),
      "Project is closed.",
      "Users can fund a closed project."
    );

    await tassert.reverts(
      cf.fundProject(closedObjReached, {
        from: account2,
        value: web3.utils.toWei("1", "Ether"),
      }),
      "Project is closed.",
      "Users can fund a closed project."
    );
  });

  it("closes a project", async () => {
    await tassert.reverts(
      cf.closeProject(open, {
        from: account2,
      }),
      "Only owner can do this operation.",
      "Users can close not their own projects."
    );

    await cf.closeProject(open, {
      from: account1,
    });
    let projectOpen = await cf.getProject(open);
    assert.equal(
      projectOpen.state,
      3, // CLOSED_OBJ_FAILED
      "The project has not been correctly closed."
    );

    await cf.closeProject(openObjReached, {
      from: account1,
    });
    let projectOpenObjReached = await cf.getProject(openObjReached);
    assert.equal(
      projectOpenObjReached.state,
      2, // CLOSED_OBJ_REACHED
      "The project has not been correctly closed."
    );

    await tassert.reverts(
      cf.closeProject(closedObjReached, {
        from: account2,
      }),
      "Project is already closed.",
      "Users can close an already closed project."
    );

    await tassert.reverts(
      cf.closeProject(closedObjFailed, {
        from: account3,
      }),
      "Project is already closed.",
      "Users can close an already closed project."
    );
  });

  it("withdraws from project balance", async () => {
    // chech if not-contributors can withdraw
    await tassert.reverts(
      cf.withdraw(closedObjFailed, true, { from: account3 }),
      "Only contributors can do this operation.",
      "Users not contributors can withdraw project balance."
    );

    // chech if contributors can withdraw from closed project with object reached
    await tassert.reverts(
      cf.withdraw(closedObjReached, true, {
        from: account3,
      }),
      "Project objective is reached.",
      "Users can withdraw from open project."
    );

    // chech if contributors can withdraw from open project
    await tassert.reverts(
      cf.withdraw(openObjReached, true, {
        from: account2,
      }),
      "Project is not closed.",
      "Users can withdraw from open project."
    );

    let projectOpenBefore = await cf.getProject(closedObjFailed);
    let balanceBefore = +(await web3.eth.getBalance(account3));
    await cf.withdraw(closedObjFailed, true, {
      from: account2,
    });
    let balanceAfter = +(await web3.eth.getBalance(account3));
    let projectOpenAfter = await cf.getProject(closedObjFailed);

    assert.equal(
      projectOpenAfter.balance,
      0,
      "The withdraw has not been correctly done."
    );

    assert.isBelow(
      balanceBefore,
      balanceAfter,
      "The withdraw has not been correctly done."
    );
  });
});
