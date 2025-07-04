import axios from 'axios';
import pdfParse from 'pdf-parse';

export const generateSummary = async (req, res) => {
    const {fileUrl, fileType} = req.body;

    try{
        const fileRes = await axios.get(fileUrl, {responseType: 'arraybuffer'});

        let text;
        if(fileType === 'pdf'){
            const data = await pdfParse(fileRes.data);
            text = data.text;
        }else if(fileType === 'text'){
            text = fileRes.data.toString('utf-8');
        }

        const summary = await llmCall();

        res.status(200).json({ summary })
            
    }catch(err){

        console.error(err);
        res.status(500).json({ error: 'Failed to summarize document.' });
        
    }
}