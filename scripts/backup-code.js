/**
 * NovaMart Code Backup Script
 * Automatically commits any modified or new files and pushes to GitHub.
 */

const { execSync } = require('child_process');

function backupCode(commitMessage) {
  try {
    // 1. Check if there are changes
    const status = execSync('git status --porcelain').toString().trim();
    if (!status) {
      console.log('[CODE-BACKUP] No code changes detected. Working tree is clean and up to date.');
      return { success: true, changed: false };
    }

    console.log('[CODE-BACKUP] Detected modified or untracked code files:');
    status.split('\n').forEach(line => console.log(`              ${line}`));

    // 2. Stage all changes
    console.log('[CODE-BACKUP] Staging changes (git add .)...');
    execSync('git add .');

    // 3. Commit with timestamp
    const now = new Date();
    const defaultMsg = `Auto-backup code: ${now.toISOString().replace('T', ' ').substring(0, 19)}`;
    const msg = commitMessage || defaultMsg;
    console.log(`[CODE-BACKUP] Committing: "${msg}"...`);
    execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`);

    // 4. Push to GitHub
    console.log('[CODE-BACKUP] Pushing to GitHub (origin main)...');
    execSync('git push origin main');

    console.log('[CODE-BACKUP] SUCCESS: Code changes backed up to GitHub successfully!');
    return { success: true, changed: true };
  } catch (err) {
    console.error('[CODE-BACKUP] ERROR during code backup:', err.message);
    return { success: false, error: err.message };
  }
}

if (require.main === module) {
  const customMessage = process.argv.slice(2).join(' ');
  backupCode(customMessage);
}

module.exports = { backupCode };
