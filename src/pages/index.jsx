import React, { useRef, useEffect, useState } from 'react';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import IconButton from '@mui/material/IconButton';
import axios from 'axios'; 
import Draggable from 'react-draggable';
import Button from '@mui/material/Button';

export default function Home() {
  const [stickyNotes, setStickyNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editableNoteId, setEditableNoteId] = useState(null);

  const fetchStickyNotes = async () => {
    try {
      const response = await axios.get('https://stickynotes-sdp5.onrender.com');
      setStickyNotes(response.data);
    } catch (error) {
      console.error('Error fetching sticky notes:', error);
    }
  };

  useEffect(() => {
    fetchStickyNotes();
  }, []);

  const addStickyNote = async () => {
    try {
      const response = await axios.post('https://stickynotes-sdp5.onrender.com', { content: newNoteContent, x: 0, y: 0 });
      const newNote = { _id: response.data._id, content: newNoteContent, x: Math.random() * 400, y: Math.random() * 400 };
      setStickyNotes(prevNotes => [...prevNotes, newNote]);
      setNewNoteContent('');
    } catch (error) {
      alert('Error adding sticky note:', error);
    }
  };

  const deleteStickyNote = async (id) => {
    try { 
      await axios.delete(`https://stickynotes-sdp5.onrender.com/${id}`);
      setStickyNotes(prevNotes => prevNotes.filter(note => note._id !== id));
    } catch (error) {
      alert('Error deleting sticky note:', error);
    }
  };

  const toggleEditMode = (id) => {
    setEditableNoteId(id === editableNoteId ? null : id);
  };

  const saveNote = async (id, updatedContent, x, y) => {
    try {
      await axios.put(`https://stickynotes-sdp5.onrender.com/${id}`, { content: updatedContent, x, y });
      setStickyNotes(prevNotes =>
        prevNotes.map(note =>
          note._id === id ? { ...note, content: updatedContent, x, y } : note
        )
      );
      setEditableNoteId(null);
    } catch (error) {
      alert('Error updating sticky note:', error);
    }
  };

  return (
    <div className="main-div">
      <div>
        <h1 style={{textAlign:'center'}}>STICKY ~ NOTES</h1>
        <textarea
          rows="10"
          value={newNoteContent}
          onChange={e => setNewNoteContent(e.target.value)}
          style={{margin:'0 auto', display:'block', width:'40%'}}
        ></textarea>
        <Button style={{margin:'20px auto', display:'block'}} variant="contained" size="large" onClick={addStickyNote}>
          Create Note
        </Button>
      </div>
      {stickyNotes.map((note, index) => (
        <Draggable key={note._id}
        defaultPosition={{ x: note.x, y: note.y }}
        onStop={(e, data) => {
          // Check if the position has changed
          if (data.x !== note.x || data.y !== note.y) {
            saveNote(note._id, note.content, data.x, data.y);
          }
        }}
        >
        <div className="Sticky-Note">
          Sticky Notes
          <IconButton
            color="primary"
            aria-label="edit"
            size="small"
            onClick={() => toggleEditMode(note._id)}
          >
            {editableNoteId === note._id ? null : <EditIcon fontSize="inherit"/>}
          </IconButton>
          <IconButton
            color="primary"
            aria-label="delete"
            size="small"
            onClick={() => deleteStickyNote(note._id)}
          >
            <RemoveCircleIcon fontSize="inherit"/>
          </IconButton>
          {editableNoteId === note._id ? (
            <IconButton
            color="primary"
            aria-label="edit"
            size="small"
            onClick={() => saveNote(note._id, note.content)}
          >
            <SaveIcon fontSize="inherit"/>
          </IconButton>
          ) : null}
          <textarea
            rows="8"
            className="sticky-note-textarea"
            value={note.content}
            readOnly={editableNoteId !== note._id}
            onChange={e => setStickyNotes(prevNotes =>
              prevNotes.map(prevNote =>
                prevNote._id === note._id ? { ...prevNote, content: e.target.value } : prevNote
              )
            )}
          ></textarea>
        </div>
        </Draggable>
      ))}
    </div>
  );
}
