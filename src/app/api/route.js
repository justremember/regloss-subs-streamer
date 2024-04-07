// Import the necessary modules for SQLite
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Initialize a variable to hold the SQLite database connection
let db = null;

// Handler for GET requests to retrieve all subs data
export async function GET(req, res) {
    // Open a new connection if there is none
    if (!db) {
        db = await open({
            filename: "./collection.db",
            driver: sqlite3.Database,
        });
    }

    // Query to get all todos from the "todo" table
    const todos = await db.all("SELECT * FROM subs");
  
    // Return the todos as a JSON response with a 200 status code
    return new Response(JSON.stringify(todos), {
        headers: { "content-type": "application/json" },
        status: 200,
    });
}

// Handler for POST requests to create a new subs log
// Accepts [{ name: string, subCount: int }]
export async function POST(req, res) {
    // Open a new connection if there is none
    if (!db) {
        db = await open({
            filename: "./collection.db",
            driver: sqlite3.Database,
        });
    }
    const rowsToAdd = await req.json();
    // Define timestamp outside of map for consistency between entries
    const timestamp = (new Date()).toISOString().replace("T", " ").slice(0, 19);

    const valuesString = rowsToAdd.map(({ name, subCount }) => {
        return `('${name}', ${subCount}, '${timestamp}')`
    }).join(", ");

    console.log({ valuesString });

    // Insert the new rows into the "subs" table
    await db.run(`INSERT INTO subs (name, subcount, timestamp) VALUES ${valuesString}`);

    // Return a success message as a JSON response with a 200 status code
    return new Response(
        JSON.stringify(
            { message: "success" },
            {
                headers: { "content-type": "application/json" },
                status: 200,
            }
        )
    );
}