const catalogEl = document.getElementById('catalog'); 
const shelfEl = document.getElementById('shelf'); 


let books = [];
let borrowedBooks = borrowedBooksFromServer || [];

// Render books to the catalog and shelf
function render() {
    catalogEl.innerHTML = '';
    shelfEl.innerHTML = '';

    borrowedBooks.forEach(book => {
        const li = document.createElement('li');

         li.innerHTML = `
    <strong>${book.title}</strong> by ${book.author}
    ${book.cover ? `<br><img src="${book.cover}" width="80">` : ""}
    <br>Year: ${book.year || "Unknown"}
    <br><a target="_blank" href="https://archive.org/stream/${book.openLibraryId}">Read Online</a>
`;
        const btn = document.createElement('button');
        btn.textContent = "Return";
        btn.onclick = async () => {
        const res = await fetch(`/api/return/${book.openLibraryId}`, { method: "POST" });
        const data = await res.json();

    if (res.status !== 200) {
        alert(data.message);
        return;
    }

    borrowedBooks = borrowedBooks.filter(b => b.openLibraryId !== book.openLibraryId);
    render();
};


        shelfEl.appendChild(li);
        li.appendChild(btn);
    });

    // Render catalog books (from search)
    books.forEach((book, index) => {
        const li = document.createElement('li');

     li.innerHTML = `
      <strong>${book.title}</strong> by ${book.author}
      ${book.cover ? `<br><img src="${book.cover}" width="80">` : ""}
      <br>Year: ${book.year || "Unknown"}
      <p>Subjects: ${book.subjects && book.subjects.length ? book.subjects.join(", ") : "N/A"}</p>
      <br>Editions: ${book.edition_count || "N/A"}
`;

        const btn = document.createElement('button');
        btn.textContent = "Borrow";
        btn.onclick = async () => {
    
        const res = await fetch(`/api/borrow/${book.ia}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        title: book.title,
        author: book.author,
        cover: book.cover,
        year: book.year
    })
});

     const data = await res.json();

    if (res.status !== 200) {
        alert(data.message);
        return;
    }

    borrowedBooks.push(data.book);
    render();
};


        catalogEl.appendChild(li);
        li.appendChild(btn);
    });
}

// Fetch books from the server using books api

async function fetchBooks(title = "", author = "") {
    try {
        const res = await fetch(`/api/books?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`);
        books = await res.json();

         if (books.length === 0) {
            catalogEl.innerHTML = "<p>No books found. Try a different search.</p>";
            return;
        }
        render();
    } catch (err) {
        console.error("Error fetching books:", err);
    }
}

// Search form
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('searchTitle').value;
    const author = document.getElementById('searchAuthor').value;
    fetchBooks(title, author);
});

// Initial render for borrowed books only
render();