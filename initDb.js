const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database, and if it doesn't exist, create it
const db = new sqlite3.Database(
    "./collection.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        // Error handling for connection
        if (err) {
            return console.error(err.message);
        } else {
            // Success message for successful connection
            console.log("Connected to the SQLite database.");
        }
    }
);

// Serialize runs to ensure sequential execution
db.serialize(() => {
    // Run SQL command to create table if it doesn't exist
    db.run(
        `CREATE TABLE IF NOT EXISTS subs (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            subcount INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        function (err) {
            if (err) {
                throw err;
            }
            console.log("Created subs table");
        }
    );

    db.run(`DELETE FROM subs`, function (err) {
        // Error handling for deletion
        if (err) {
            throw err;
        }
        console.log("Deleted items in subs table");
    });

    // Close the database connection
    db.close(function (err) {
        if (err) {
            throw err;
        }
        console.log("Closed the database connection.");
    });
});