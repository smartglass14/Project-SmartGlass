import Poll from "../models/Poll.js"; 
import Session from "../models/Session.js"

export const createPoll = async(req, res)=>{
    const { pollData, sessionId } = req.body;

    if(!pollData){
        return res.status(400).json({ message : "Poll data needed" })
    }
    
    try{
        let poll = await Poll.findOne({session: sessionId});
        if(poll){
            return res.status(400).json({message: "Poll already exists"})
        }

        const newPoll = new Poll({
            session: sessionId,
            question: pollData.question,
            options: pollData.options.map((text) => ({ text  })),
          });
        
        await newPoll.save();

        return res.status(201).json({ message: "New Poll created !"})

    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal server error"})
    }   

}

export const getPollByCode = async(req, res)=> {
    const {code: sessionCode } = req.params;

    if(!sessionCode){
        return res.status(400).json({message: "Session Code needed"});
    }

    try{
        const session = await Session.findOne({sessionCode});
        if(!session){
            return res.status(400).json({message: "Invalid Session Code"});
        }
        if(session.expiresAt <= Date.now){
            return res.status(400).json({message: "Poll time Expired"})
        }

        const poll = await Poll.findOne({session: session._id}).populate('session');
        if(!poll){
            return res.status(400).json({message: "Can not find Poll"});
        }
        res.status(200).json({poll});

    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Failed to access Poll"});
    }   
}

export const getPollResult = async (req, res) => {
    try{
        const { code:sessionCode } = req.params;
        const userId = req.userId;

        if(!sessionCode){
            return res.status(400).json({message: "Session Code needed"});
        }

        const session = await Session.findOne({sessionCode}).populate('educator');
        if(!session){
            return res.status(400).json({message: "Invalid Session Code"});
        }

        if(String(userId) !== String(session.educator._id)){
            return res.status(402).json({message: "Unauthorized! only creater can access result"});
        }

        const poll = await Poll.findOne({session: session._id}).populate({
            path: 'session',
            populate: { path: 'educator', model: 'User' }
          });
        
        if(!poll){
            return res.status(400).json({message: "Can not find Poll"});
        }
        res.status(200).json({poll});
    
    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Failed to access Poll"});
    }   
}