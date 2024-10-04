import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(64).toString("hex");
}

const token = generateToken();
console.log(token);
