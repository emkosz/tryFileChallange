// kunna ladda upp filer av typ xml, pdf och jpeg samt metadata        [v]
// spara upladdare, filnamn, beskrivning, datum i datastorage          [v]
// lista filerna i en kolumn                                           [v]
// det ska ga att ladda ner filerna                                    [v]
// det ska ga att ta bort filerna                                      [v]
// det ska ga att ta bort filerna med knapp i tabellen                 [v]
// strukturera koden                                                   [v]
// snygga till vyn                                                     []
// ikoner beskriver de olika filtyperna                                [v]
// Visa datum da filen laddades upp                                    [v]

import express, { json } from 'express';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import filesRouts from './express-api/routes/filesRoutes.js';
import fs from 'fs/promises';
import storage from './storage.json' assert { type: "json" };
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(filesRouts);

// Middleware, methodOverride is used in order to be able to access a delete method from html
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  }))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectoryPath = path.join(__dirname, 'public');
app.use('/public', express.static(publicDirectoryPath));

app.get('/', async (req, res) => {
  const fileTable = await generateFileTable();
  const fileForm = generateFileForm()

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
    <title>Files service</title>
    <h1>Welcome to Files service</h1>
    <p>Upload, download or delete files</p>
    </head>
    <body>
    <h2>Files</h2>
    <body>${fileTable}</body>
    <h2>Upload files</h2>
    <body>${fileForm}</body>
  `);
});

async function readFile(path) {
  try {
    return await fs.readFile(path, { encoding: 'utf8' });
  } catch (err) {
    console.log(err);
  }
}

async function generateFileTable() {
  const fileMetaData = await readFile('./storage.json');
  const data = JSON.parse(fileMetaData);
  const pdfIcon = '<img src="/public/pdf-file-icon.svg" alt="Image">';
  const jpgIcon = '<img src="/public/jpg-file-icon.svg" alt="Image">';
  const xmlIcon = '<img src="/public/xml-file-icon.svg" alt="Image">';

  let table = '<table border="1">';
  table += '<tr><th>Icon</th><th>Uploaded by</th><th>Description</th><th>Date</th><th>Filename</th><th>Download</th></th><th>Delete file</th></tr>';
  data.forEach(e => {
    let icon;
    if(e.extension === '.jpg') {
      icon = jpgIcon;
    } else if(e.extension === '.pdf') {
      icon = pdfIcon;
    } else if(e.extension === '.xml') {
      icon = xmlIcon;
    }
    let timestamp = e.date;
    let date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'numeric', day: 'numeric' });

    table += `<tr><td>${icon}</td>`;
    table += `<td>${e.uploader}</td><td>${e.description}</td><td>${formattedDate}</td><td>${e.file}</td>`;
    table += `<td><a href=/api/file/download/${e.id} target=_blank>Download file</a></td>`;
    table += `<td><form action="/api/file/delete" method="post">`;
    table +=  `<input type=hidden name=_method value="delete">`;
    table +=  `<input type=hidden name=id value=${e.id}>`;
    table += `<button type=submit>Delete file</button></form></td></tr>`;
  });
  table += '</table>';
  return table;
}

function generateFileForm() {
  let form = '<form action="/api/file/upload" enctype="multipart/form-data" method="post">';
  form += '<div>Name of uploader: <input type="text" name="uploader" /></div>';
  form += '<div>Description of file: <input type="description" name="description" /></div>';
  form += '<div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>'
  form += '<input type="submit" value="Upload" />'
  form += '</form>'
  return form;
}

async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`File ${filePath} has been deleted.`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('The file does not exist');
    } else {
      console.error(err);
      console.log(`Unable to delete file ${filePath}.`);
    }
    console.error(err);
  }
}

async function removeFromPersistentStorage(index) {
  if (index > -1) {
    storage.splice(index, 1);
    await fs.writeFile('storage.json', JSON.stringify(storage), err => {
      if (err) {
        console.error(err);
      }
    });
    console.log('File metadata removed from persistent storage');
    return;
  } else {
    console.log('No uploaded files exists, not able to delete file');
    return;
  }
}

app.delete('/api/file/delete', async (req, res) => {
  const id = req.body.id;
  const filePath = storage.find(x => x.id === id).filePath;
  const index = storage.findIndex(x => x.id === id);
  // delete the file from system storage
  await deleteFile(filePath);
  // remove metadata from persistent storage
  await removeFromPersistentStorage(index);
  res.redirect('/')
})

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});