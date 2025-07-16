const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  console.log("Authorization header received:", req.headers["authorization"]);

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("No authorization header found!");
    return res.status(401).json({ message: "Access denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  if (!token) {
    console.log("Token is missing!");
    return res.status(401).json({ message: "Access denied" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Invalid token!");
      return res.status(403).json({ message: "Invalid token" });
    }

    console.log("User authenticated:", user);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;









































































// const jwt = require("jsonwebtoken");

// function authenticateToken(req, res, next) {
// console.log("Authorization header:", req.headers["authorization"]);
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) return res.status(401).json({ message: "Access denied" });

//   const token = req.headers["authorization"]?.split(" ")[1]; // Extract token
//   if (!token) return res.status(401).json({ message: "Access denied" });

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: "Invalid token" });

//     req.user = user;
//     next();
//   });
// }


// module.exports = authenticateToken;
