import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import Database from 'better-sqlite3';
import express, { request } from "express";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const db_path = path.join(__dirname, 'notes.db');
const db = new Database(db_path);

const PORT = 5000;

const app = express();

app.use(express.json());
app.use(cors());

const default_color = "color-yellow";

app.get("/api/notes", async (req, res) => {
    try {
        const selectStmt = db.prepare('SELECT * FROM notes');
        const rows = selectStmt.all();
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post("/api/notes", async (req, res) => {
    const { title, content, color } = req.body;
    if (!title || !content) {
        return res.status(400).send("title and content fields required");
    }
    if (!color) {color = default_color;}
    try {
        const sql = `
            INSERT INTO notes (id, title, content, color)
            VALUES (?, ?, ?, ?)
        `;
        const id = Math.floor(Date.now() / 1000);
        const insertStmt = db.prepare(sql);
        insertStmt.run(id, title, content, color);
        const selectStmt = db.prepare('SELECT * FROM notes');
        const rows = selectStmt.all();
        res.status(200).json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error saving new note.");
    }
});

app.put("/api/notes", async (req, res) => {
    const { id, title, content, color } = req.body;
    const _id = parseInt(id);
    if (!id || isNaN(id)) {
        return res.status(400).send("ID must be a valid number");
    }
    if (!title || !content) {
        return res.status(400).send("title and content fields required");
    }
    if (!color) {color = default_color;}
    try {
        // Send the note update
        let sql = `
            UPDATE notes
            SET title = ?, content = ?, color = ?
            WHERE id = ?
        `;
        const updateStmt = db.prepare(sql);
        updateStmt.run(title, content, color, _id);
        const selectStmt = db.prepare('SELECT * FROM notes');
        const rows = selectStmt.all();
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).send("Error updating note.");
    }
});

app.delete("/api/notes", async (req, res) => {
    const { id } = req.body;
    const _id = parseInt(id);
    if (!id || isNaN(id)) {
        return res.status(400).send("ID msut be a valid number");
    }
    try {
        // Send the note update
        const sql = 'DELETE FROM notes WHERE id = ?'
        const deleteStmt = db.prepare(sql);
        deleteStmt.run(_id);
        const selectStmt = db.prepare('SELECT * FROM notes');
        const rows = selectStmt.all();
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).send("Error deleting note.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});