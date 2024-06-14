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
  table += '<tr><th>Uploader</th><th>Description</th> <th>File</th><th>Filepath</th></tr>';
  data.forEach(e => {
    table += `<tr><td>${e.uploader}</td><td>${e.description}</td><td>${e.file}</td><td>${e.filePath}</td></tr>`;
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
            description: fields.title[0],
            file: orgFilename,
            filePath: files.someExpressFiles[0].filepath,
            extension: "extension",
            date: Date.now()
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

app.get('/download', async (req, res) => {
  const filePath = "/var/folders/qh/n_fqny510xlgd8ljrvfp7gd80000gn/T/f52dbe47e937743b7c46c2f01";

  res.download(filePath, err => {
    if(err) {
      console.log(err);
    } else {

    }
  })
})

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});