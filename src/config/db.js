const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const dbFile = path.join(__dirname, '../../ecommerce.sqlite');

let database = null;

async function initDb() {
    if (database) return database;

    const SQL = await initSqlJs();

    if (fs.existsSync(dbFile)) {
        const fileData = fs.readFileSync(dbFile);
        database = new SQL.Database(fileData);
    } else {
        database = new SQL.Database();
    }

    // 1. Users table (Planned for Week 2)
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

    // 2. Products table (Week 1 Core Entity)
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

    // 3. Orders table (Planned for Week 2)
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

function saveToFile() {
    if (!database) return;
    const binaryData = database.export();
    fs.writeFileSync(dbFile, Buffer.from(binaryData));
}

async function query(sql, params = []) {
    const db = await initDb();
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

    if (isSelect) {
        const statement = db.prepare(sql);
        statement.bind(params);
        const rows = [];
        while (statement.step()) {
            rows.push(statement.getAsObject());
        }
        statement.free();
        return { rows };
    } else {
        db.run(sql, params);
        const idResult = db.exec("SELECT last_insert_rowid() AS id");
        let newId = null;
        if (idResult.length > 0 && idResult[0].values.length > 0) {
            newId = idResult[0].values[0][0];
        }
        saveToFile();
        return { rows: [{ id: newId }] };
    }
}

module.exports = {
    initDb,
    query
};
