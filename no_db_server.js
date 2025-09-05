import express, { request } from "express";
import cors from "cors";

const PORT = 5000;

const app = express();

app.use(express.json());
app.use(cors());

const notes = [
    { id: 1, title: "test note 1", content: "bla bla note1", color: "color-yellow" },
    { id: 2, title: "test note 2", content: "bla bla note2", color: "color-blue" },
    { id: 3, title: "test note 3", content: "bla bla note3", color: "color-green" },
    { id: 4, title: "test note 4", content: "bla bla note4", color: "color-red" },
    { id: 5, title: "test note 5", content: "bla bla note5", color: "color-pink" },
    { id: 6, title: "test note 6", content: "bla bla note6", color: "color-purple" },
];

const default_color = "color-yellow";
let nextId = notes.length + 1;

app.get("/api/notes", async (req, res) => {
    res.json(notes);
});

app.post("/api/notes", async (req, res) => {
    const { title, content, color } = req.body;

    if (!title || !content) {
        return res.status(400).send("title and content fields required");
    }

    if (!color) {
        color = default_color;
    }

    try {
        const newNote = {
            id: nextId++,
            title,
            content,
            color,
        };
        notes.push(newNote);
        res.json(newNote);
    } catch (error) {
        res.status(500).send("Error saving new note.");
    }
});

app.put("/api/notes", async (req, res) => {
    const { id, title, content, color } = req.body;
    const _id = parseInt(id);

    if (!id || isNaN(id)) {
        return res.status(400).send("ID msut be a valid number");
    }
    
    if (!title || !content) {
        return res.status(400).send("title and content fields required");
    }
    
    if (!color) {
        color = default_color;
    }
    
    try {
        const idx = notes.findIndex(n => n.id === _id);
        if (idx === -1) {
            return res.status(400).send("ID not found");
        }
        notes[idx] = { ...notes[idx], title, content, color };
        res.json(notes);
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
        const idx = notes.findIndex(n => n.id === _id);
        if (idx === -1) {
            return res.status(400).send("ID not found");
        }
        console.log(notes[idx]);
        notes.splice(idx, 1);
        res.json(notes);
    } catch (error) {
        res.status(500).send("Error deleting note.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});