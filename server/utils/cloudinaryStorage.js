import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../services/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: `SmartGlass/${req.userId || "anonymous"}`,
    resource_type: 'raw',
    allowed_formats: ['pdf', 'txt'],
     public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, "")}`,
     format: 'pdf'
  }),
});

const upload = multer({ storage });

export default upload;