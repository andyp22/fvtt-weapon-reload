import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ZipArchive } from "archiver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");
const packageDir = path.join(root, "package");
const zipPath = path.join(root, "fvtt-weapon-reload.zip");

const files = [
  "module.json",
];

const folders = [
  "dist",
  "languages",
  "packs",
  "templates",
];

function copy() {
  fs.rmSync(packageDir, { recursive: true, force: true });
  fs.mkdirSync(packageDir, { recursive: true });

  for (const file of files) {
    const source = path.join(root, file);
    const destination = path.join(packageDir, file);

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }

  for (const folder of folders) {
    const source = path.join(root, folder);
    const destination = path.join(packageDir, folder);

    fs.cpSync(source, destination, {
      recursive: true,
    });
  }
}

function zip() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);

    const archive = new ZipArchive();

    output.on("close", () => {
      console.log(`Created ${zipPath}`);
      console.log(`${archive.pointer()} bytes`);
      resolve();
    });

    archive.on("error", reject);
    output.on("error", reject);

    archive.pipe(output);
    archive.directory(packageDir, false);
    archive.finalize();
  });
}


async function main() {
  console.log("Preparing package...");
  copy();

  console.log("Creating ZIP...");
  await zip();

  console.log("Finished");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

