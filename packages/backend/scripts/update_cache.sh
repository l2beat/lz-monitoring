#!/bin/bash

# Check if the Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "Error: Heroku CLI is not installed."
    exit 1
fi

# Check if the PostgreSQL utilities are installed
if ! command -v pg_restore &> /dev/null; then
    echo "Error: PostgreSQL utilities (pg_restore) are not installed."
    exit 1
fi

# Function to convert a date to seconds since 1970
date_to_seconds() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux (GNU date)
        date -d "$1" +%s
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS (BSD date)
        if [[ "$1" =~ ^[0-9]{2}:[0-9]{2}:[0-9]{2} ]]; then
            # Handle time format without date (use current date)
            TIME_PART=$(echo "$1" | cut -d ' ' -f1)
            date -jf "%T" "$TIME_PART" +%s
        else
            # Strip the timezone and trim spaces
            STRIPPED_DATE=$(echo "$1" | awk 'BEGIN {OFS=" "} {$5=""; gsub(/[[:space:]]+/, " "); print $0}' | xargs)
            date -jf "%a %b %d %T %Y" "$STRIPPED_DATE" +%s
        fi
    else
        echo "Unsupported OS for date conversion."
        exit 1
    fi
}


# Get the current timestamp
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILENAME=".db/dump.$TIMESTAMP"

# Find the most recent backup file with the given naming format
LATEST_DUMP=$(ls .db/dump.* 2>/dev/null | sort -r | head -n1)

# Get the most recent Heroku backup's date
HEROKU_BACKUP_DATE=$(heroku pg:backups --app lz-monitoring | grep -E '^b[0-9]+' | head -n 1 | awk '{print $3 " " $4}')

# Convert the Heroku backup's date and current date to seconds for comparison
HEROKU_BACKUP_SECONDS=$(date_to_seconds "$HEROKU_BACKUP_DATE")
CURRENT_SECONDS=$(date_to_seconds "$(date)")

# Check if the Heroku backup is not older than 1 day (86400 seconds in a day)
if [[ $((CURRENT_SECONDS - HEROKU_BACKUP_SECONDS)) -le 86400 ]]; then
  RECENT_HEROKU_BACKUP=true
else
  RECENT_HEROKU_BACKUP=false
fi

# If no local dump file exists or the most recent local dump is older than 2 days, capture and download a new backup
if [[ -z "$LATEST_DUMP" ]] || [[ $(find "$LATEST_DUMP" -mtime +2) ]]; then
    # If no recent Heroku backup exists, capture a new one
    if [[ $RECENT_HEROKU_BACKUP == false ]]; then
        heroku pg:backups:capture --app lz-monitoring
    fi

    # If an older dump file exists, notify about it
    if [[ -n "$LATEST_DUMP" ]]; then
        echo "Removing old $LATEST_DUMP..."
        rm "$LATEST_DUMP"
    fi

    echo "Downloading the latest backup from Heroku..."
    echo $BACKUP_FILENAME
    # Download the latest backup to a file with the timestamped name
    heroku pg:backups:download --app lz-monitoring --output $BACKUP_FILENAME
    LATEST_DUMP=$BACKUP_FILENAME
else
    echo "$LATEST_DUMP is less than two days old. Using the existing backup."
fi

# Restore the downloaded backup to the local database
echo "Restoring the backup to the local database..."
pg_restore --clean --no-acl --no-owner -h localhost -d local "$LATEST_DUMP"

# Check the success of pg_restore
if [[ $? -eq 0 ]]; then
    echo "Backup restored successfully to the 'local' database."
else
    echo "Error: pg_restore failed."
    exit 1
fi
