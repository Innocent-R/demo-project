require("dotenv").config({ path: "./config/.env" });
const express = require('express');
const app = express();
const passport = require('passport');
const PORT = process.env.PORT || 5050;
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const configDB = process.env.DB_STRING;
const axios = require('axios'); 

// connecting database
mongoose.connect(configDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Library app running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error("MongoDB connection error:", err));


// middleware
app.use(express.json());
app.use(session({
    secret: "librarysecret",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

require('./config/passport')(passport);
require('./app/routes.js')(app, passport);

app.use(express.static('public'));


// auth middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.redirect('/login');
}
// Api for books
app.get('/api/books', isLoggedIn, async (req, res) => {
    try {
        const title = req.query.title || "";
        const author = req.query.author || "";

        const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=20`;
        const response = await axios.get(url);

        const books = response.data.docs.map((b, index) => ({
            id: index + 1,
            title: b.title || "Unknown",
            subtitle: b.subtitle || "", 
            author: b.author_name ? b.author_name[0] : "Unknown",
            year: b.first_publish_year || "Unknown",
            publisher: b.publisher ? b.publisher[0] : "Unknown", 
            subjects: b.subject ? b.subject.slice(0, 5) : [],
            edition_count: b.edition_count || "N/A",
            cover: b.cover_i
                ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`
                : null,
            has_fulltext: b.has_fulltext,
            ia: b.ia ? b.ia[0] : null,
            url: b.key ? `https://openlibrary.org${b.key}` : null, 
            borrowed: false
        }));

        res.json(books);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching books." });
    }
});

// Borrow a book route
app.post('/api/borrow/:ia', isLoggedIn, async (req, res) => {
    const ia = req.params.ia;

    const { title, author, cover, year } = req.body;

    if (!title || !author) {
        return res.status(400).json({ message: "Missing book data." });
    }

    // Preventing duplicates
    const alreadyBorrowed = req.user.borrowedBooks.some(
        b => b.openLibraryId === ia
    );

    if (alreadyBorrowed) {
        return res.status(400).json({ message: "Book already borrowed." });
    }

    // Saving to database
    req.user.borrowedBooks.push({
        openLibraryId: ia,
        title,
        author,
        cover,
        year,
        borrowedAt: new Date()
    });

    await req.user.save();

    res.json({
        message: `You borrowed "${title}"`,
        book: {
            openLibraryId: ia,
            title,
            author,
            cover,
            year
        }
    });
});
// Return a book route
app.post('/api/return/:ia', isLoggedIn, async (req, res) => {
    const ia = req.params.ia;

    const before = req.user.borrowedBooks.length;

    req.user.borrowedBooks = req.user.borrowedBooks.filter(
        b => b.openLibraryId !== ia
    );

    if (req.user.borrowedBooks.length === before) {
        return res.status(400).json({ message: "Book was not borrowed." });
    }

    await req.user.save();

    res.json({ 
        message: "Book returned successfully.",
        borrowedBooks: req.user.borrowedBooks
    });
});




