const { generateToken } = require("./token");
const { getUser, recordLoginAttempt } = require("../db/user_repo");

async function loginUser(username, password) {
  const user = await getUser(username);

  if (!user) {
    await recordLoginAttempt(username, false);
    return null;
  }

  await recordLoginAttempt(username, true);

  return generateToken(user);
}

module.exports = { loginUser };
