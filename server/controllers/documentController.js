import Document from "../models/Document.js";
import axios from "axios";

export const uploadFile = async (req, res) => {
    try {
        const userId = req.userId;

        const uploaded = req.files.map(file => ({
            originalName: file.originalname,
            fileUrl: file.path,
            public_id: file.filename,
            uploadedBy: userId,
            fileType: file.mimetype.split('/')[1],
        }));

        if (uploaded.length === 0) {
        return res.status(400).json({ message: "No file uploaded" });
        }

        const docs = await Document.insertMany(uploaded);

        for (const doc of docs) {
            try {
                await axios.post(`${process.env.AI_MODEL_URL}/upload-pdf`, {
                    file_url: doc.fileUrl,
                    file_type: doc.fileType
                });
            } catch (err) {
                console.error(`Failed to upload document ${doc._id} to vector DB:`, err.message);
                return res.status(500).json({message: "Failed to upload documents into AI-model"})
            }
        }

        res.status(200).json({ message: "Files uploaded successfully"});

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Upload failed! Please try again." });
    }
}

export const getAllDocs = async (req, res)=>{
    const userId = req.userId;

    try{

        let docs = await Document.find({uploadedBy: userId}).sort({uploadedAt: -1});

        if(!docs || docs.length == 0){
            return res.status(400).json({message: "You doesn't uploaded any document yet!"});
        }
        
        res.status(200).json(docs);

    }catch(err){
        console.log("document getting error: ",err);
        return res.status(500).json({message: "failed to get documents"});
    }
}