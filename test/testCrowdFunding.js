const { assert } = require("chai");
const tassert = require("truffle-assertions");

const CrowdFunding = artifacts.require("CrowdFunding");

contract("CrowdFunding", ([deployer, secondAcc]) => {
  let crowdFunding;
  let crowdFundingOwner;
  let address;

  beforeEach(async () => {
    crowdFunding = await CrowdFunding.deployed();
    crowdFundingOwner = await crowdFunding.owner();
    address = crowdFunding.address;
  });

  it("deploys successfully", async () => {
    assert.equal(crowdFundingOwner, deployer, "Owner is not correct.");
    assert.notEqual(address, 0x0, "Address is not correct.");
    assert.notEqual(address, "", "Address is not correct.");
    assert.notEqual(address, null, "Address is not correct.");
    assert.notEqual(address, undefined, "Address is not correct.");
  });

  it("creates a project", async () => {
    let projectCountBefore = await crowdFunding.projectCount();

    // get the timestamp in seconds
    timestamp = Math.floor(new Date().getTime() / 1000);

    await crowdFunding.createProject(
      "test-project-name",
      "test-project-description",
      timestamp + 1.296e6, // 15 days in seconds
      web3.utils.toWei("5", "Ether"),
      { from: secondAcc }
    );

    let projectCountAfter = await crowdFunding.projectCount();

    assert.equal(
      projectCountAfter.toNumber(),
      projectCountBefore.toNumber() + 1,
      "Project count before project creation not correct."
    );

    project = await crowdFunding.getProject(projectCountAfter);
    assert.equal(
      project.owner,
      secondAcc,
      "Owner of the created project is not correct."
    );
    assert.equal(
      project.id,
      projectCountAfter,
      "Id of the created project is not correct."
    );
    assert.equal(
      project.name,
      "test-project-name",
      "Name of the created project is not correct."
    );
    assert.equal(
      project.desc,
      "test-project-description",
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

  it("allows funding a project", async () => {
    // get the timestamp in seconds
    timestamp = Math.floor(new Date().getTime() / 1000);

    await crowdFunding.createProject(
      "test-project-name",
      "test-project-description",
      timestamp + 1.296e6, // 15 days in seconds
      web3.utils.toWei("5", "Ether"),
      { from: deployer }
    );

    let projectId = await crowdFunding.projectCount();

    await crowdFunding.fundProject(projectId, {
      from: secondAcc,
      value: web3.utils.toWei("1", "Ether"),
    });

    project = await crowdFunding.getProject(projectId);
    assert.equal(
      project.balance,
      web3.utils.toWei("1", "Ether"),
      "After funding, the balance of the project is not correct."
    );

    await tassert.reverts(
      crowdFunding.fundProject(projectId, {
        from: deployer,
        value: web3.utils.toWei("1", "Ether"),
      }),
      "Owner can't fund the project created by themselves.",
      "It permits users to fund their own projects."
    );
  });

  it("allows closing a project", async () => {
    // get the timestamp in seconds
    timestamp = Math.floor(new Date().getTime() / 1000);

    await crowdFunding.createProject(
      "test-project-name",
      "test-project-description",
      timestamp + 1.296e6, // 15 days in seconds
      web3.utils.toWei("5", "Ether"),
      { from: deployer }
    );

    let projectId = await crowdFunding.projectCount();

    await tassert.reverts(
      crowdFunding.closeProject(projectId, {
        from: secondAcc,
      }),
      "Only owner can do this operation.",
      "It allows users closing not their own projects."
    );

    await crowdFunding.closeProject(projectId, {
      from: deployer,
    });

    project = await crowdFunding.getProject(projectId);

    assert.equal(
      project.state,
      3, // CLOSED_OBJ_FAILED
      "The project has not been correctly closed."
    );

    await tassert.reverts(
      crowdFunding.fundProject(projectId, {
        from: secondAcc,
        value: web3.utils.toWei("1", "Ether"),
      }),
      "Project is closed.",
      "It allows users to fund closed projects."
    );
  });
});
