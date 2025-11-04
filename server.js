const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Books in the store
let books = [
  { id: 1, title: "The Handmaid's Tale by Margaret Atwood", borrowed: false },
  { id: 2, title: "The Hunger Games by Suzanne Collins", borrowed: false },
  { id: 3, title: "Brave New World by Aldous Huxley", borrowed: false },
  { id: 4, title: "To Kill a Mockingbird by Harper Lee", borrowed: false },
  { id: 5, title: "The Kite Runner by Khaled Hosseini", borrowed: false },
  { id: 6, title: "Animal Farm by George Orwell", borrowed: false }
];

// api for books
app.get('/api/books', (req, res) => {
  res.json(books);
});

// borrowing books
app.post('/api/borrow/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (book && !book.borrowed) {
    book.borrowed = true;
    res.json({ message: `You borrowed "${book.title}"`, book });
  } else {
    res.status(400).json({ message: 'Book is already borrowed or does not exist.' }); //I used chatgpt to get res.status() as a method to send away json response
  }
});

// returning books
app.post('/api/return/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (book && book.borrowed) {
    book.borrowed = false;
    res.json({ message: `You returned "${book.title}"`, book });
  } else {
    res.status(400).json({ message: 'Book is not borrowed or does not exist.' });
  }
});

app.listen(PORT, () => console.log(`Library app running on http://localhost:${PORT}`));

