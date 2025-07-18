import axios from 'axios';
import Document from './../models/Document.js';

export const uploadAndSummarize = async (req, res) => {
  const { fileId, fileUrl, fileType, bulletPoints = false, maxTokens = 2000 } = req.body;

  if (!fileUrl || !fileType || !fileId) {
    return res.status(400).json({ message: 'Please Select Document' });
  }

  try {

    const summaryRes = await axios.post(`${process.env.AI_MODEL_URL}/summary`, {
      file_url: fileUrl,
      file_type: fileType,
      bullet_points: bulletPoints,
      max_tokens: maxTokens
    });

    const summary = summaryRes.data.summary;

    let doc = await Document.findById(fileId);
    if(!doc){
        return res.status(400).json({message: "Document not found"})
    }
    doc.summary = summary;
    await doc.save();

    return res.status(200).json({ summary });
  } catch (err) {
    console.error('[uploadAndSummarize ERROR]', err.message);
    return res.status(500).json({ message: 'Summary generation failed' });
  }
};
