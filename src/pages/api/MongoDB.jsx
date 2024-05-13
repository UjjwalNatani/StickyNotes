const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://ujjwalnatani10:Ugnatani@cluster0.mqwninh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define a schema for the sticky notes
const stickyNoteSchema = new mongoose.Schema({
    content: String,
    x: Number,
    y: Number
});

const StickyNote = mongoose.model('StickyNote', stickyNoteSchema);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/', async (req, res) => {
    try {
        const stickyNotes = await StickyNote.find();
        res.json(stickyNotes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/', async (req, res) => {
    const { content, x, y } = req.body; // Include x and y coordinates in the request body

    const stickyNote = new StickyNote({
        content: content,
        x: x,
        y: y
    });

    try {
        const newStickyNote = await stickyNote.save();
        res.status(201).json(newStickyNote);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedNote = await StickyNote.findByIdAndDelete(id);
        if (!deletedNote) {
            return res.status(404).json({ message: 'Sticky note not found' });
        }
        res.json({ message: 'Sticky note deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { content, x, y } = req.body; // Include x and y coordinates in the request body

    try {
        const updatedNote = await StickyNote.findByIdAndUpdate(id, { content, x, y }, { new: true });
        if (!updatedNote) {
            return res.status(404).json({ message: 'Sticky note not found' });
        }
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
