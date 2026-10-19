/**
 * NovaMart Database Restore Script
 * Restores `ecommerce_db` from `database/backups/ecommerce_db_latest.sql`
 * or a specified backup file.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.resolve(__dirname, '..', 'database', 'backups');
const LATEST_FILE = path.join(BACKUP_DIR, 'ecommerce_db_latest.sql');

function restoreDatabase(targetFile = LATEST_FILE) {
  if (!fs.existsSync(targetFile)) {
    console.error(`[DB-RESTORE] ERROR: Target backup file not found: ${targetFile}`);
    process.exit(1);
  }

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const dbName = process.env.DB_NAME || 'ecommerce_db';
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';

  console.log(`[DB-RESTORE] Restoring database '${dbName}' from: ${path.relative(process.cwd(), targetFile)}...`);

  const env = { ...process.env, MYSQL_PWD: password };

  try {
    // 1. Ensure database exists
    execSync(`mysql -h ${host} -P ${port} -u ${user} -e "CREATE DATABASE IF NOT EXISTS \`${dbName}\`;"`, { env });

    // 2. Restore tables and data from SQL file
    // On Windows, pass via stdin to mysql
    const fileContent = fs.readFileSync(targetFile);
    execSync(`mysql -h ${host} -P ${port} -u ${user} ${dbName}`, {
      env,
      input: fileContent,
      maxBuffer: 100 * 1024 * 1024
    });

    console.log(`[DB-RESTORE] SUCCESS: Database '${dbName}' restored successfully!`);
    return true;
  } catch (err) {
    console.error(`[DB-RESTORE] ERROR: Restore failed:`, err.message);
    return false;
  }
}

if (require.main === module) {
  const customFile = process.argv[2] ? path.resolve(process.argv[2]) : LATEST_FILE;
  restoreDatabase(customFile);
}

module.exports = { restoreDatabase };
