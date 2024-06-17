import express from 'express';
import { uploadFile, downloadFile, deleteFile } from '../controllers/filesController.js';


const router = express.Router();

router.post('/api/file/upload', uploadFile);
router.get('/api/file/download/:id', downloadFile);
// router.delete('/api/file/delete', deleteFile);

export default router;