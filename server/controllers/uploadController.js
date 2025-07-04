import Document from "../models/Document.js";

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

        await Document.insertMany(uploaded);

        res.status(200).json({ message: "Files uploaded successfully", filesData: uploaded });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Upload failed! Please try again." });
    }
}