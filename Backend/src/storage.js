const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function appendRecord(fileName, record) {
  await ensureDataDir();

  const filePath = path.join(dataDir, fileName);

  let current = [];
  try {
    const raw = await fs.readFile(filePath, "utf8");
    current = JSON.parse(raw);
    if (!Array.isArray(current)) {
      current = [];
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  current.push(record);
  await fs.writeFile(filePath, JSON.stringify(current, null, 2), "utf8");
}

module.exports = {
  appendRecord,
};
