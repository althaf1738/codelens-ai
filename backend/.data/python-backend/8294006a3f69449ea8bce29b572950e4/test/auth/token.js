const SECRET = "hardcoded-secret"; 

function generateToken(user) {
  const payload = {
    sub: user.username,
    role: user.role || "user",
    issuedAt: Date.now(),
  };

  const raw = JSON.stringify(payload) + ":" + SECRET;
  return Buffer.from(raw).toString("base64");
}

function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    return decoded.includes(SECRET);
  } catch {
    return false;
  }
}

module.exports = { generateToken, verifyToken };
