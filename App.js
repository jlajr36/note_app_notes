import { useEffect, useState } from "react";
import "./App.css";

function useGlobalKey(key, handler) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === key) handler(e);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [key, handler]);
}

function App() {
  const addr = "http://127.0.0.1:5000/api/notes";

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("color-yellow");
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const colors = [
    { name: "color-yellow", hex: "#ffffe0" }, // light yellow
    { name: "color-blue", hex: "#e0f0ff" },   // light blue
    { name: "color-green", hex: "#e0ffe0" },  // light green
    { name: "color-red", hex: "#ffe0e0" },    // light red/pinkish
    { name: "color-pink", hex: "#ffe0f0" },   // light pink
    { name: "color-purple", hex: "#f0e0ff" }  // light purple/lavender
  ];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(addr);
        if (!res.ok) throw new Error("Failed to fetch notes.");
        const data = await res.json();
        setNotes(data);
      } catch (error) {
        setError(error.message || "unkown error");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    setSelectedColor(colors.find(c => c.name === color));
  }, []);

  const clearForm = () => {
    setTitle("");
    setContent("");
    setColor("color-yellow");
    setSelectedNote(null);
    setSelectedColor(colors.find(c => c.name === "color-yellow"));
  };

  const escape = () => clearForm();
  useGlobalKey("Escape", escape);

  const handleAddNote = async (event) => {
    event.preventDefault();
    const newNote = {title, content, color};
    try {
      const res = await fetch(addr, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });

      if (!res.ok) throw new Error("Note add failed");
      const updatedNotes = await res.json();
      setNotes(updatedNotes);
      clearForm();
    } catch {
      setError(error.message);
    }
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || "color-yellow");
    setSelectedColor(colors.find(c => c.name === (note.color || "color-yellow")));
  };

  const handleUpdateNote = async (event) => {
    event.preventDefault();
    if (!selectedNote) return;
    const updatedNote = { id: selectedNote.id, title, content, color };
    try {
      const res = await fetch(addr, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNote),
      });
      if (!res.ok) throw new Error("Note update failed");
      const updatedNotes = await res.json();
      setNotes(updatedNotes);
      clearForm();
    } catch {
      setError(error.message || "Unknow error");
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const res = await fetch(addr, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      const updatedNotes = await res.json();
      setNotes(updatedNotes);
      if (selectedNote?.id === id) clearForm();
    } catch {
      setError(error.message || "Unknow Error");
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    clearForm();
  };

  return (
    <div className="app-container">
      <form 
        className="note-form" 
        onSubmit={(event) => (selectedNote ? handleUpdateNote(event) : handleAddNote(event))}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Title" 
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          rows={10}
          required
        />
        <div style={{ display: "flex", gap: 10 }}>
          {colors.map(({ name, hex }) => (
            <div
              key={name}
              onClick={() => {
                setSelectedColor({ name, hex });
                setColor(name);
              }}
              title={name}
              style={{
                backgroundColor: hex,
                width: 50,
                height: 50,
                border: selectedColor?.name === name ? "3px solid black" : "2px solid #ccc",
                borderRadius: 5,
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
          ))}
        </div>
        {selectedNote ? (
          <div className="edit-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="submit">Add Note</button>
        )}
      </form>

      <div className="notes-grid">
        {notes.map((note) => (
          <div
            className="note-item"
            key={note.id}
            onClick={() => handleNoteClick(note)}
            style={{ backgroundColor: colors.find(c => c.name === note.color)?.hex }}
          >
            <div className="notes-header">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note.id);
                }}
              >
                x
              </button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
