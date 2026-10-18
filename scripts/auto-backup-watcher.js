/**
 * NovaMart Unified Auto-Backup Watcher
 * ---------------------------------------------------------
 * 1. Database Safety: Monitors MySQL `ecommerce_db` continuously.
 *    Whenever data changes (INSERT, UPDATE, DELETE, or ALTER),
 *    it automatically triggers a full mysqldump snapshot.
 * 
 * 2. Code Safety: Watches project source files.
 *    Whenever files are modified, it waits for changes to settle (debounce),
 *    then automatically commits and pushes to GitHub.
 * ---------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { backupDatabase } = require('./backup-db');
const { backupCode } = require('./backup-code');

const ROOT_DIR = path.resolve(__dirname, '..');
const DB_POLL_INTERVAL_MS = 5000; // Check DB every 5 seconds
const CODE_DEBOUNCE_MS = 12000;    // Wait 12s after last file change before git commit/push

let lastDbFingerprint = null;
let lastTableChecksums = {};
let codeChangeTimeout = null;
let pendingChangedFiles = new Set();
let isBackingUpCode = false;
let isBackingUpDb = false;

// Ignore list for code watcher
const IGNORE_PATTERNS = [
  /[\\/]\.git([\\/]|$)/,
  /[\\/]node_modules([\\/]|$)/,
  /[\\/]target([\\/]|$)/,
  /[\\/]dist([\\/]|$)/,
  /[\\/]database[\\/]backups([\\/]|$)/,
  /[\\/]backup([\\/]|$)/,
  /[\\/]logs([\\/]|$)/,
  /\.(tmp|bak|log|swp)$/i,
  /~$/,
  /Thumbs\.db$/i,
  /\.DS_Store$/i
];

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(rx => rx.test(filePath));
}

// =========================================================================
// 1. DATABASE MONITORING (MySQL ecommerce_db)
// =========================================================================

function getDbChecksums() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const dbName = process.env.DB_NAME || 'ecommerce_db';
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || 'Parth@1749';
  const env = { ...process.env, MYSQL_PWD: password };

  try {
    // 1. Get all tables
    const showCmd = `mysql -h ${host} -P ${port} -u ${user} -s -N -e "USE \`${dbName}\`; SHOW TABLES;"`;
    const tablesRaw = execSync(showCmd, { env, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    if (!tablesRaw) return { fingerprint: 'empty', tables: {} };

    const tables = tablesRaw.split(/\r?\n/).map(t => t.trim()).filter(Boolean);
    if (tables.length === 0) return { fingerprint: 'empty', tables: {} };

    // 2. Query CHECKSUM TABLE for all tables
    const checksumCmd = `mysql -h ${host} -P ${port} -u ${user} -s -N -e "USE \`${dbName}\`; CHECKSUM TABLE ${tables.map(t => '`' + t + '`').join(', ')};"`;
    const checksumsRaw = execSync(checksumCmd, { env, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();

    const tableMap = {};
    let fingerprintStr = '';

    checksumsRaw.split(/\r?\n/).forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const fullTableName = parts[0];
        const tableName = fullTableName.replace(`${dbName}.`, '');
        const sum = parts[1];
        tableMap[tableName] = sum;
        fingerprintStr += `${tableName}:${sum};`;
      }
    });

    return { fingerprint: fingerprintStr, tables: tableMap };
  } catch (err) {
    // MySQL might be temporarily starting or busy
    return null;
  }
}

function checkDatabaseChanges() {
  if (isBackingUpDb) return;

  const current = getDbChecksums();
  if (!current) return;

  if (lastDbFingerprint === null) {
    // Initial baseline on startup
    lastDbFingerprint = current.fingerprint;
    lastTableChecksums = current.tables;
    console.log(`[DB-WATCHER] Connected to MySQL. Monitoring ${Object.keys(current.tables).length} tables for changes...`);
    return;
  }

  if (current.fingerprint !== lastDbFingerprint) {
    // Detect which specific tables changed
    const changedTables = [];
    const allKeys = new Set([...Object.keys(current.tables), ...Object.keys(lastTableChecksums)]);
    for (const tbl of allKeys) {
      if (current.tables[tbl] !== lastTableChecksums[tbl]) {
        changedTables.push(tbl);
      }
    }

    lastDbFingerprint = current.fingerprint;
    lastTableChecksums = current.tables;

    console.log(`\n======================================================`);
    console.log(`[DB-WATCHER] DATABASE MODIFIED: Changes in [${changedTables.join(', ')}]`);
    console.log(`             Triggering automatic database snapshot for data safety...`);
    console.log(`======================================================`);

    isBackingUpDb = true;
    try {
      backupDatabase();
    } finally {
      isBackingUpDb = false;
    }
  }
}

// =========================================================================
// 2. CODE MONITORING (Frontend, Backend, Configs, etc.)
// =========================================================================

function triggerCodeBackup() {
  if (isBackingUpCode) return;
  isBackingUpCode = true;

  const changedList = Array.from(pendingChangedFiles);
  pendingChangedFiles.clear();

  console.log(`\n======================================================`);
  console.log(`[CODE-WATCHER] CODE MODIFIED: ${changedList.length} file(s) changed.`);
  console.log(`              Committing and pushing to GitHub for data safety...`);
  console.log(`======================================================`);

  try {
    const summary = changedList.slice(0, 3).map(f => path.basename(f)).join(', ') + (changedList.length > 3 ? ` +${changedList.length - 3} more` : '');
    const now = new Date().toLocaleTimeString();
    backupCode(`Auto-backup (${now}): Updated ${summary}`);
  } finally {
    isBackingUpCode = false;
  }
}

function onFileChanged(eventType, relativePath) {
  if (!relativePath) return;
  const fullPath = path.resolve(ROOT_DIR, relativePath);

  if (shouldIgnore(fullPath) || shouldIgnore(relativePath)) return;

  pendingChangedFiles.add(relativePath);

  if (codeChangeTimeout) clearTimeout(codeChangeTimeout);
  codeChangeTimeout = setTimeout(() => {
    triggerCodeBackup();
  }, CODE_DEBOUNCE_MS);
}

function startFileWatcher() {
  console.log('[CODE-WATCHER] Watching project files for changes...');

  const watchOptions = { recursive: true };
  try {
    fs.watch(ROOT_DIR, watchOptions, (eventType, filename) => {
      onFileChanged(eventType, filename);
    });
  } catch (err) {
    console.error('[CODE-WATCHER] Error initializing root watcher:', err.message);
  }
}

// =========================================================================
// MAIN ENTRY POINT
// =========================================================================

function startAutoBackupWatcher() {
  console.clear();
  console.log(`======================================================================`);
  console.log(`     NovaMart Auto-Backup System (Continuous Data & Code Safety)      `);
  console.log(`======================================================================`);
  console.log(` [1] MySQL Database Watcher: Active (polls every ${DB_POLL_INTERVAL_MS / 1000}s for changes)`);
  console.log(` [2] Code Change Watcher:    Active (auto-commits & pushes to GitHub)`);
  console.log(` [3] Storage Locations:`);
  console.log(`       - DB Latest:  database/backups/ecommerce_db_latest.sql`);
  console.log(`       - DB History: database/backups/history/`);
  console.log(`       - Git Remote: https://github.com/Parthpatel1749/Novamart`);
  console.log(`======================================================================\n`);

  // Initial code backup check on startup
  console.log('[INITIALIZATION] Performing baseline backup checks...');
  backupDatabase();
  backupCode('Auto-backup: Baseline save on watcher startup');

  // Start continuous watchers
  startFileWatcher();
  setInterval(checkDatabaseChanges, DB_POLL_INTERVAL_MS);

  console.log(`\n[ACTIVE] Auto-backup watcher is running. Press Ctrl+C to stop.\n`);
}

// Handle clean exit
process.on('SIGINT', () => {
  console.log('\n[AUTO-BACKUP] Stopping auto-backup watcher...');
  process.exit(0);
});

startAutoBackupWatcher();
