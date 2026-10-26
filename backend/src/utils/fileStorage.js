const fs = require('fs').promises;
const path = require('path');

// Queue map to serialize writes per file (prevents concurrent write corruption)
const writeQueues = new Map();

/**
 * Enqueue a task to be executed sequentially for a given key (file path)
 */
function serialize(key, task) {
  const previous = writeQueues.get(key) || Promise.resolve();
  const next = previous.then(task, task); // always proceed even if previous had error
  writeQueues.set(key, next);
  return next;
}

/**
 * Reads and parses a JSON file safely
 * @param {string} filePath 
 * @param {any} defaultFallback 
 */
async function readJsonFile(filePath, defaultFallback = []) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw.trim()) {
      return defaultFallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Ensure file exists with default fallback
      await writeJsonFile(filePath, defaultFallback);
      return defaultFallback;
    }
    console.error(`Error reading JSON file at ${filePath}:`, err.message);
    throw new Error(`Data storage read error: ${err.message}`);
  }
}

/**
 * Writes data safely using atomic write (write to .tmp then rename) and serialized queues
 * @param {string} filePath 
 * @param {any} data 
 */
async function writeJsonFile(filePath, data) {
  return serialize(filePath, async () => {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    const tempFilePath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
    const jsonString = JSON.stringify(data, null, 2);

    try {
      await fs.writeFile(tempFilePath, jsonString, 'utf8');
      await fs.rename(tempFilePath, filePath);
    } catch (err) {
      // Clean up temp file if exists
      try {
        await fs.unlink(tempFilePath);
      } catch (_) {}
      console.error(`Error writing JSON file at ${filePath}:`, err.message);
      throw new Error(`Data storage write error: ${err.message}`);
    }
  });
}

module.exports = {
  readJsonFile,
  writeJsonFile,
  serialize
};
