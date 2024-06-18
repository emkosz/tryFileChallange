import express, { json } from 'express';
import formidable from 'formidable';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import storage from '../../storage.json' assert { type: "json" };
import fs from 'fs/promises';

export const uploadFile = async (req, res, next) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  express.static(path.join(__dirname, '../../uploads'));
  const form = formidable({ uploadDir: './uploads'});
  
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    const orgFilename = files.someExpressFiles[0].originalFilename;

    if (orgFilename.endsWith('.xml') || orgFilename.endsWith('.pdf') || orgFilename.endsWith('.jpg')) {
      const fileData = {
        uploader: fields.uploader[0],
        description: fields.description[0],
        file: orgFilename,
        filePath: files.someExpressFiles[0].filepath,
        extension: orgFilename.match(/\.[0-9a-z]+$/i)[0],
        date: Date.now(),
        id: uuidv4()
      };
      storage.push(fileData);
      fs.writeFile('storage.json', JSON.stringify(storage), err => {
        if (err) {
          console.log(err);
        } else {
          console.log('File uploaded correctly');
        }
      });
      res.redirect('/')
    } else {
        console.log('wrong file extension');
        res.json("Unlawful file extension. .jpg, .png and .xml allowed").status(400);
    }
  });
};

export const downloadFile = (req, res) => {
  const id = req.params.id;
  const filePath = storage.find(x => x.id === id).filePath;
  const fileName = storage.find(x => x.id === id).file;

  res.download(filePath, fileName, err => {
    if(err) {
      console.log('failed to download file', err,);
      res.status(404);
    } else {
      console.log('file downloaded successfully');
    }
  })
};
