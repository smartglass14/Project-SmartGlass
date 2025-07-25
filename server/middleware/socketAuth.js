import jwt from "jsonwebtoken";

export default function socketAuth (socket, next) {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Unauthorized!"));
    }   
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id || decoded.guestId;
        socket.userName = decoded.name || decoded.guestName;
        next();
    }catch(err){
        return next(new Error("Unauthorized!"));
    }
}