import { useState, useEffect } from "react";

function App() {
  const [uiState, setUiState] = useState("loading");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);

  async function getNotes() {
    const res = await fetch("/get");
    const { notes: resNotes } = await res.json();

    setNotes(resNotes);
    setUiState("loaded");
  }

  async function addNote(e) {
    e.preventDefault();
    setUiState("loading");

    try {
      const res = await fetch("/add", {
        method: "POST",
        body: JSON.stringify({
          text,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      const { notes: resNotes } = await res.json();
      setNotes(resNotes);
      setText("");
      setUiState("loaded");
    } catch (e) {
      setUiState("error");
      console.error(e);
    }
  }

  useEffect(() => {
    try {
      getNotes();
    } catch (e) {
      setUiState("error");
      console.error(e);
    }
  }, []);

  switch (uiState) {
    case "loaded":
      return (
        <div>
          <form onSubmit={addNote}>
            <input value={text} onChange={(e) => setText(e.target.value)} />
            <button>Submit</button>
          </form>
          <div className="notes">
            {notes.length ? (
              notes.map((note) => <h1>{note}</h1>)
            ) : (
              <h1>no notes added yet</h1>
            )}
          </div>
        </div>
      );
    case "loading":
      return <h1>loading …</h1>;
    default:
      return <h1>there was an error</h1>;
  }
}

export default App;
