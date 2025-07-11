import Poll from "../models/Poll.js"; 

export const createPoll = async(req, res)=>{
    const { pollData, sessionCode } = req.body;

    if(!pollData){
        return res.status(400).json({ message : "Poll data needed" })
    }
    
    try{
        let poll = await Poll.findOne(sessionCode);
        if(poll){
            return res.status(400).json({message: "Poll already exists"})
        }

        const newPoll = new Poll({...pollData})
        await newPoll.save();
        return res.status(201).json({ message: "New Poll created !"})

    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal server error"})
    }   

}

export const getPollByCode = async(req, res)=> {
    const sessionCode = req.params;

    if(!sessionCode){
        return res.status(400).json({message: "Session Code needed"});
    }

    try{
        const poll = await Poll.findOne(sessionCode);
        if(!poll){
            res.status(400).json({message: "Invalid Session Code"});
        }
        res.status(200).json(poll);

    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Failed to creat Poll"});
    }   
}
