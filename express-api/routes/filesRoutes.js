import express from 'express';
import { uploadFile, downloadFile } from '../controllers/filesController.js';


const router = express.Router();

router.post('/api/file/upload', uploadFile);
router.get('/api/file/download/:id', downloadFile);

export default router;