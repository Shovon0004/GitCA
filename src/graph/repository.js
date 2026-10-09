const driver = require("../config/neo4j");

async function createRepository(owner, name) {
  const result = await driver.executeQuery(
    `
    MERGE (r:Repository {
      owner: $owner,
      name: $name
    })
    RETURN r
    `,
    {
      owner,
      name
    }
  );

  return result.records[0].get("r").properties;
}

module.exports = {
  createRepository
};