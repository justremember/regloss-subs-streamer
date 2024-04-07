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
    rowsToAdd.forEach(async (row) => {
        // Extract the name & subcount from the request body
        const { name, subCount } = row;
        // Insert the new task into the "subs" table
        await db.run("INSERT INTO subs (name, subcount) VALUES (?, ?)", [name, subCount]);
    })

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