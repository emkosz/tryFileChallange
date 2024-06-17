export async function removeFileFromStorage(filePath) {
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

export function addToPersistentStorage(fields, files) {
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
    fs.writeFile('../../../storage.json', JSON.stringify(storage), err => {
      if (err) {
        console.error(err);
      } else {
        console.log('File uploaded correctly');
      }
    });
  }
  
  export async function removeFromPersistentStorage(index) {
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

  export async function readFile(path) {
    try {
      return await fs.readFile(path, { encoding: 'utf8' });
    } catch (err) {
      console.log(err);
    }
  }