import { Console } from "console";
import fs, { existsSync } from "fs";
import Path from "path";
import util from "util";

const readdir = util.promisify(fs.readdir);
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);

async function getFileExtensions(dir) {
  const files = await readdir(dir);

  const fileTypes = {};

  for (const file of files) {
    const filePath = Path.join(dir, file);
    const stats = await stat(filePath);

    if (stats.isFile()) {
      const extType = Path.extname(file).toLowerCase() || ".noext";
      if (!fileTypes[extType]) {
        fileTypes[extType] = [];
      }
      fileTypes[extType].push(filePath);
    }
  }

  return fileTypes;
}

const createFolderWithExt = async (fileTypes, dir) => {
  for (const [extension, filePaths] of Object.entries(fileTypes)) {
    const newFolder = extension.startsWith(".") ? extension.slice(1) : "noext";
    const newFolderPath = Path.join(dir, newFolder);

    // Ensure folder is created
    if (!existsSync(newFolderPath)) {
      await mkdir(newFolderPath, { recursive: true });
    }

    let i = 1;
    for (const file of filePaths) {
      const fileName = Path.basename(file);
      let newPath = Path.resolve(newFolderPath, fileName);

      // check if file already exists and creates duplicate
      while (existsSync(newPath)) {
        const ext = Path.extname(fileName);
        const base = Path.basename(fileName, ext);
        newPath = Path.resolve(newFolderPath, `${base}(${i})${ext}`);
        i++;
      }

      // Move the file
      fs.rename(file, newPath, (err) => {
        if (err) {
          console.error(`Error moving file: ${file} -> ${newPath}`, err);
        } else {
          console.log(`Moved: ${file} -> ${newPath}`);
        }
      });
    }
  }
};

const checkFileType = async (dir) => {
  try {
    const fileTypes = await getFileExtensions(dir);
    await createFolderWithExt(fileTypes, dir);
  } catch (err) {
    console.error("Error:", err);
  }
};

checkFileType("/home/shasha/Downloads");
