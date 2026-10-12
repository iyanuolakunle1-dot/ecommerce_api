const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

// The file where all database data is stored
const dbFile = path.join(__dirname, 'ecommerce.sqlite');

let database = null;

// Connect to SQLite and create the tables if they don't exist yet
async function initDb() {
    if (database) return database;

    const SQL = await initSqlJs();

    // If the database file already exists on your laptop, load it.
    // Otherwise, create a fresh empty database.
    if (fs.existsSync(dbFile)) {
        const fileData = fs.readFileSync(dbFile);
        database = new SQL.Database(fileData);
    } else {
        database = new SQL.Database();
    }

    // 1. Users table
    database.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Products table
    database.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 3. Orders table (links user and product together)
    database.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    saveToFile();
    return database;
}

// Writes the SQLite database memory to the local ecommerce.sqlite file
function saveToFile() {
    if (!database) return;
    const binaryData = database.export();
    fs.writeFileSync(dbFile, Buffer.from(binaryData));
}

// Simple helper function to run SQL queries in the routes
async function query(sql, params = []) {
    const db = await initDb();
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

    if (isSelect) {
        // Run a SELECT query and return the rows as normal JavaScript objects
        const statement = db.prepare(sql);
        statement.bind(params);
        const rows = [];
        while (statement.step()) {
            rows.push(statement.getAsObject());
        }
        statement.free();
        return { rows };
    } else {
        // Run an INSERT, UPDATE, or DELETE query
        db.run(sql, params);

        // Find the ID of the row that was just inserted
        const idResult = db.exec("SELECT last_insert_rowid() AS id");
        let newId = null;
        if (idResult.length > 0 && idResult[0].values.length > 0) {
            newId = idResult[0].values[0][0];
        }

        saveToFile();

        const rows = (newId && newId > 0) ? [{ id: newId }] : [];
        return { rows };
    }
}

module.exports = {
    query,
    initDb
};
