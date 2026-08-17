#!/bin/bash
# ============================================
#  Acclaira — Automated Backup Script
# ============================================
set -e

BACKUP_DIR="/root/backups"
DATE=$(date +%F_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "==> Starting Acclaira backup: $DATE"

# 1. Backup Next.js SQLite Database
if [ -f "/root/acclaira_repo/data/acclaira.db" ]; then
    echo "Backing up application database..."
    cp "/root/acclaira_repo/data/acclaira.db" "$BACKUP_DIR/acclaira_db_$DATE.sqlite"
fi

# 2. Backup Mail Server Database
if [ -f "/opt/mailserver/data/users.db" ]; then
    echo "Backing up mail server database..."
    cp "/opt/mailserver/data/users.db" "$BACKUP_DIR/mail_users_$DATE.db"
fi

# 3. Rotate backups (keep last 14 days)
find "$BACKUP_DIR" -type f -mtime +14 -delete

echo "==> Backup complete! Saved to $BACKUP_DIR"
