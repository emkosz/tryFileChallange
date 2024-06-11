// kunna ladda upp filer av typ xml, pdf och jpeg samt metadata        [v]
// spara upladdare, filnamn, beskrivning, datum i datastorage          [v]
// lista filerna i en kolumn                                           [v]
// ikoner beskriver de olika filtyperna                                []
// det ska ga att oppna och ladda ner filerna                          []
// det ska ga att ta bort filerna                                      []

import express, { json } from 'express';
import formidable from 'formidable';
import fs from 'fs/promises';
import storage from './storage.json' assert { type: "json" };

const app = express();

app.get('/', (req, res) => {
  res.send(`
    <h2>With <code>"express"</code> npm package</h2>
    <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>Name of uploader: <input type="text" name="uploader" /></div>
      <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
});

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

        res.json({ fields, files });
    } else {
        console.log('wrong file extension');
        res.json("Unlawful file extension. .jpg, .png and .xml allowed").status(400);
    }
  });
});

async function readFile() {
  try {
    const data = await fs.readFile('./storage.json', { encoding: 'utf8' });
    const parsedData = JSON.parse(data);
    return parsedData;
  } catch (err) {
    console.log(err);
  }
}

function generateTable(data) {
  let table = '<table border="1">';
  table += '<tr><th>Uploader</th><th>Description</th> <th>File</th><th>Filepath</th></tr>';
  data.forEach(e => {
    table += `<tr><td>${e.uploader}</td><td>${e.description}</td><td>${e.file}</td><td>${e.filePath}</td></tr>`;
  });
  table += '</table>';
  return table;
  }

app.get('/files', async (req, res) => {
  const fileData = await readFile();
  const view = generateTable(fileData);
  res.send(view);
})

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});