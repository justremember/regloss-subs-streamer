// Import the necessary modules for SQLite
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

// Initialize a variable to hold the SQLite database connection
let db: Database<sqlite3.Database, sqlite3.Statement>;

// Handler for GET requests to retrieve all subs data
export async function GET(req: Request, res: Response) {
    console.log("Received GET request");
    // Open a new connection if there is none
    if (!db) {
        db = await open({
            filename: "./collection.db",
            driver: sqlite3.Database,
        });
    }

    // Query to get all subs from the "subs" table
    const subs = await db.all<DbSubsTableRow[]>("SELECT name, subcount AS subCount, timestamp FROM subs");

    // Return the todos as a JSON response with a 200 status code
    return new Response(JSON.stringify(subs), {
        headers: { "content-type": "application/json" },
        status: 200,
    });
}

// Handler for POST requests to create a new subs log
export async function POST(req: Request, res: Response) {
    console.log("Received POST request");
    // Open a new connection if there is none
    if (!db) {
        db = await open({
            filename: "./collection.db",
            driver: sqlite3.Database,
        });
    }
    const rowsToAdd: DbSubsTableRow[] = await req.json();

    const valuesString = rowsToAdd.map(({ name, subCount, timestamp }) => {
        return `('${name}', ${subCount}, '${timestamp}')`
    }).join(", ");

    console.log({ valuesString });

    // Insert the new rows into the "subs" table
    await db.run(`INSERT INTO subs (name, subcount, timestamp) VALUES ${valuesString}`);

    // Return a success message as a JSON response with a 200 status code
    return new Response(
        JSON.stringify({ message: "success" }),
        {
            headers: { "content-type": "application/json" },
            status: 200,
        },
    );
}