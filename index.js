// kunna ladda upp filer av typ xml, pdf och jpeg samt metadata        [v]
// spara upladdare, filnamn, beskrivning, datum i datastorage          [v]
// lista filerna i en kolumn                                           [v]
// ikoner beskriver de olika filtyperna                                []
// det ska ga att ladda ner filerna                                    [v]
// det ska ga att ta bort filerna                                      []

import express, { json } from 'express';
import formidable from 'formidable';
import fs from 'fs/promises';
import storage from './storage.json' assert { type: "json" };
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.get('/', async (req, res) => {
  const fileTable = await generateFileTable();
  const fileForm = generateFileForm()

  res.send(`
    <h2>Files</h2>
    <body>${fileTable}</body>
    <h2>Upload files</h2>
    <body>${fileForm}</body>
  `);
});

async function generateFileTable() {
  const storagePath = './storage.json';
  const fileData = await readFile(storagePath);
  const data = JSON.parse(fileData);

  let table = '<table border="1">';
  table += '<tr><th>Uploader</th><th>Description</th> <th>Filename</th><th>Download</th></tr>';
  data.forEach(e => {
    table += `<tr><td>${e.uploader}</td><td>${e.description}</td><td>${e.file}</td>`;
    table += `<td><a href=/api/download/${e.id} target=_blank>Download file</a></td></tr>`;
  });
  table += '</table>';
  return table;
}

function generateFileForm() {
  let form = '<form action="/api/upload" enctype="multipart/form-data" method="post">';
  form += '<div>Name of uploader: <input type="text" name="uploader" /></div>';
  form += '<div>Description of file: <input type="description" name="description" /></div>';
  form += '<div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>'
  form += '<input type="submit" value="Upload" />'
  form += '</form>'
  return form;
}

app.post('/api/upload', (req, res, next) => {
  const form = formidable({});

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
            extension: "extension",
            date: Date.now(),
            id: uuidv4()
        };
        storage.push(fileData);
        fs.writeFile('storage.json', JSON.stringify(storage), err => {
          if (err) {
            console.error(err);
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
});

async function readFile(path) {
  try {
    return await fs.readFile(path, { encoding: 'utf8' });
  } catch (err) {
    console.log(err);
  }
}

app.get('/api/download/:fileId', (req, res) => {
  const id = req.params.fileId;
  const filePath = storage.find(x => x.id === id).filePath;
  const fileName = storage.find(x => x.id === id).file;

  res.download(filePath, fileName, err => {
    if(err) {
      console.log('download failed')
      console.log(err);
      res.status(404);
    } else {
      console.log('file downloaded successfully');
    }
  })
})

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});