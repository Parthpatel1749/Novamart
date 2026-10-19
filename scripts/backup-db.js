/**
 * NovaMart Database Backup Script
 * Creates a clean SQL dump of `ecommerce_db` using mysqldump.
 * Saves both a current 'latest' snapshot and a timestamped historical snapshot.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.resolve(__dirname, '..', 'database', 'backups');
const HISTORY_DIR = path.join(BACKUP_DIR, 'history');
const LATEST_FILE = path.join(BACKUP_DIR, 'ecommerce_db_latest.sql');
const MAX_HISTORY_FILES = 50;

function formatTimestamp(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function backupDatabase() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const dbName = process.env.DB_NAME || 'ecommerce_db';
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';

  const timestamp = formatTimestamp();
  const historyFile = path.join(HISTORY_DIR, `${dbName}_${timestamp}.sql`);

  // Prepare environment variable for mysqldump to avoid password prompt/warning on CLI
  const env = { ...process.env, MYSQL_PWD: password };

  // Run mysqldump
  const cmd = `mysqldump -h ${host} -P ${port} -u ${user} --single-transaction --routines --triggers --set-gtid-purged=OFF ${dbName}`;

  try {
    const dumpBuffer = execSync(cmd, { env, maxBuffer: 100 * 1024 * 1024 });

    // Write to latest file
    fs.writeFileSync(LATEST_FILE, dumpBuffer);
    // Write to timestamped history file
    fs.writeFileSync(historyFile, dumpBuffer);

    const sizeKb = (dumpBuffer.length / 1024).toFixed(2);
    console.log(`[DB-BACKUP] SUCCESS [${timestamp}] Database: '${dbName}' | Size: ${sizeKb} KB`);
    console.log(`            -> Latest: ${path.relative(process.cwd(), LATEST_FILE)}`);
    console.log(`            -> History: ${path.relative(process.cwd(), historyFile)}`);

    pruneOldHistory();
    return { success: true, timestamp, sizeKb, latestFile: LATEST_FILE, historyFile };
  } catch (err) {
    console.error(`[DB-BACKUP] ERROR: Failed to dump database '${dbName}':`, err.message);
    return { success: false, error: err.message };
  }
}

function pruneOldHistory() {
  try {
    const files = fs.readdirSync(HISTORY_DIR)
      .filter(f => f.endsWith('.sql'))
      .map(f => ({ name: f, time: fs.statSync(path.join(HISTORY_DIR, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_HISTORY_FILES) {
      const toDelete = files.slice(MAX_HISTORY_FILES);
      for (const file of toDelete) {
        fs.unlinkSync(path.join(HISTORY_DIR, file.name));
      }
    }
  } catch (e) {
    // Non-critical cleanup
  }
}

if (require.main === module) {
  backupDatabase();
}

module.exports = { backupDatabase, formatTimestamp };
