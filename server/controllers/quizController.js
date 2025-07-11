import Quiz from './../models/Quiz.js';
import Session from './../models/Session.js';

export const createQuiz = async(req, res)=>{
    const { quizData, sessionId } = req.body;

    if(!quizData){
        return res.status(400).json({ message : "Quiz data needed" })
    }
    
    try{
        let existing = await Quiz.findOne( {session: sessionId} );
        if(existing){
            return res.status(400).json({message: "Quiz already exists"})
        }

        const transformedQuestions = quizData.questions.map(q => ({
            question: q.question,
            correctOption: q.correctOption,
            options: q.options.map(opt => ({
              text: opt,   
              votes: 0
            }))
          }));
    
        const newQuiz = new Quiz({
            title: quizData.title,
            questions: transformedQuestions,
            session : sessionId
        })
        await newQuiz.save();
        return res.status(201).json({ message: "New Quiz created !", })

    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Failed to create Quiz"})
    }   

}

export const getQuizByCode = async(req, res)=> {
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
            return res.status(400).json({message: "Quiz time Expired"})
        }

        const quiz = await Quiz.findOne({session: session._id});
        if(!quiz){
            return res.status(400).json({message: "Can not find Quiz"});
        }
        res.status(200).json({quiz});

    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Failed to access Quiz"});
    }   
}

export const getQuizResult = async (req, res) => {
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

        const quiz = await Quiz.findOne({session: session._id});
        
        if(!quiz){
            return res.status(400).json({message: "Can not find Quiz"});
        }
        res.status(200).json({quiz});
    
    }catch(err){
        console.log(err);
        return res.status(500).json({message: "Failed to access Quiz"});
    }   
}