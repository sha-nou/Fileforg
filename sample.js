import fs from "fs";
import util from "util";
import Path from "path";

const stat = util.promisify(fs.stat);
const readdir = util.promisify(fs.readdir);

async function readAndDetFiles() {
  const dir = "/Users/josiasaurel/code/oss/memcached";
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = Path.join(dir, file);
    if (file.startsWith(".")) continue;
    const fileStat = await stat(filePath)
    if (fileStat.isSymbolicLink()) {
      console.log(`${file} is a symbolic link`);
    } else console.log("File is not symbolic link");
    // console.log(fileStat);
  }
}

readAndDetFiles();
