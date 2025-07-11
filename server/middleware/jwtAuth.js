import jwt from "jsonwebtoken";

export default function jwtAuth (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized! Login to get access" });
  }
};
