-- one row per (IST day, event); n is every hit, the visitors table de-duplicates devices
CREATE TABLE IF NOT EXISTS hits (day TEXT NOT NULL, event TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, event));
CREATE TABLE IF NOT EXISTS visitors (event TEXT NOT NULL, vid TEXT NOT NULL, day TEXT NOT NULL, PRIMARY KEY (event, vid));
