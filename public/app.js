const catalogEl = document.getElementById('catalog'); //Assigning variable catalogEl to the html element
const shelfEl = document.getElementById('shelf'); //Assigning variable shelfEl to the html element

let books = [];

async function fetchBooks() {
  const res = await fetch('/api/books');
  books = await res.json(); //converting response to json
  render();
}

function render() {
    catalogEl.innerHTML = '';
    shelfEl.innerHTML = '';

    books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = book.title;

        const btn = document.createElement('button');
        if (book.borrowed) { //if books if borrowed
            btn.textContent = 'Return';
            btn.onclick = () => returnBook(book.id);
            shelfEl.appendChild(li);
            li.appendChild(btn);
        } else {
            btn.textContent = 'Borrow';
            btn.onclick = () => borrowBook(book.id); 
            catalogEl.appendChild(li);
            li.appendChild(btn);
        }
    });
}

async function borrowBook(id) {
  await fetch(`/api/borrow/${id}`, { method: 'POST' }); //Sending an asynchronous POST request to 'api'
  fetchBooks(); //call fetchBooks function to reflesh the list
}

async function returnBook(id) {
  await fetch(`/api/return/${id}`, { method: 'POST' });
  fetchBooks(); //calling to function to reflesh
}


fetchBooks(); //call the function to load and shows all books

//I used chaptgpt, google resources and house gardener for additional debugging references 