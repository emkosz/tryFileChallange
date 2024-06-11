// kunna ladda upp filer av typ xml, pdf och jpeg samt metadata        [v]
// spara upladdare, filnamn, beskrivning, datum i datastorage          []
// lista filerna i en kolumn, ikoner beskriver de olika filtyperna     []
// det ska ga att oppna och ladda ner filerna                          []
// det ska ga att ta bort filerna                                      []



import express from 'express';
import formidable from 'formidable';

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
    console.log(files.someExpressFiles[0].originalFilename);

    const orgFilename = files.someExpressFiles[0].originalFilename

    if (orgFilename.endsWith('.xml') || orgFilename.endsWith('.pdf') || orgFilename.endsWith('.jpg')) {
        res.json({ fields, files });
    } else {
        console.log('wrong file extension')
        res.json("Unlawful file extension. .jpg, .png and .xml allowed").status(400)
    }
   
  });
});

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});