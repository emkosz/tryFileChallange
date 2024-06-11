// kunna ladda upp filer av typ xml, pdf och jpeg samt metadata        [v]
// spara upladdare, filnamn, beskrivning, datum i datastorage          [v]
// lista filerna i en kolumn                                           []                                         
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
            "Uploader": fields.uploader[0],
            "Description": fields.title[0],
            "File": orgFilename,
            "FilePath": files.someExpressFiles[0].filepath,
            "Extension": "extension",
            "Date": Date.now()
        }

        console.log('storage before push', storage);
        storage.push(fileData);
        console.log('storage after push', storage);

        fs.writeFile('storage.json', JSON.stringify(fileData), err => {
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

app.get('/files', (req, res) => {

    const view =
    `<table border="1"> 
        <tr> 
            <th>Header 1</th> 
            <th>Header 2</th> 
            <th>Header 3</th> 
        </tr> 
        <tr> 
            <td>Data 1</td> 
            <td>Data 2</td> 
            <td>Data 3</td> 
        </tr> 
        <tr> 
            <td>Data 4</td> 
            <td>Data 5</td> 
            <td>Data 6</td> 
        </tr> 
    </table>`

    res.send(view);

})

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});