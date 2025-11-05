-- Add parent passcode hash column to users table
ALTER TABLE users
  ADD COLUMN parent_passcode_hash TEXT;
