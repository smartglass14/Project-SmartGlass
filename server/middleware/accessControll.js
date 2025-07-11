export default function accessControll (req, res, next){
    try{
        if(req.role == "Student"){
            return res.status(401).json({message: "Unauthorized! Only Educator can access"})
        }
        next();
    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
}