import jwt from "jsonwebtoken";

export default function jwtAuth (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Auth token missing! Please Login to access" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    req.guestId = decoded.guestId;
    req.guestName = decoded?.guestName;
    req.isGuest = decoded?.guest;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Unauthorized! Login to get access" });
  }
};
