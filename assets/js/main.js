function validateInput(input) {
  input.value = input.value.replace(/[^0-9]/g, '');

  // Periksa panjang input
  if (input.value.length > 4) {
    input.value = input.value.slice(0, 4);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const submitBook = document.getElementById('inputBook');
  submitBook.addEventListener('submit', function (e) {
    e.preventDefault();
    addBook();
    this.reset();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const completeRead = document.getElementById('inputBookIsComplete').checked; // Menggunakan 'checked' untuk checkbox

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, completeRead);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  };
}

const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedREADList = document.getElementById('incompleteBookshelfList');
  uncompletedREADList.innerHTML = '';

  const completedREADList = document.getElementById('completeBookshelfList');
  completedREADList.innerHTML = '';

  // Urutkan array books berdasarkan ID terbaru
books.sort((a, b) => b.id - a.id);

// Buat elemen card dan tambahkan ke daftar yang sesuai
for (const bookItem of books) {
  const card = makeTodo(bookItem);

  if (!bookItem.isCompleted) {
    uncompletedREADList.appendChild(card);
  } else {
    completedREADList.appendChild(card);
  }
}

});

function makeTodo(bookObject) {
  const bookTitle = document.createElement('h2');
  bookTitle.innerText = bookObject.title;
  const author = document.createElement('p');
  author.innerText = `Penulis : ${bookObject.author}`;

  const yearBook = document.createElement('p');
  yearBook.innerText = `Tahun : ${bookObject.year}`; // Menggunakan 'yearBook' bukan 'textTimestamp'

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(bookTitle, author, yearBook);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.innerText = 'Belum Selesai dibaca';
    undoButton.classList.add('undo-button');

    undoButton.addEventListener('click', function () {
      undoBookCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.innerText = 'Hapus Buku';
    trashButton.classList.add('trash-button');

    trashButton.addEventListener('click', function () {
      let confirmation = confirm(`Apakah Anda yakin ingin menghapus buku ${bookObject.title} ?`);

      if (confirmation) {
        removeBookCompleted(bookObject.id);
      }
    });

    const groupingBtn = document.createElement('div');
    groupingBtn.append(undoButton, trashButton);
    groupingBtn.classList.add('group-btn');

    container.append(groupingBtn);
  } else {
    const checkButton = document.createElement('button');
    checkButton.innerText = 'Selesai dibaca';
    checkButton.classList.add('check-button');

    checkButton.addEventListener('click', function () {
      addBookCompleted(bookObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.innerText = 'Hapus Buku';
    trashButton.classList.add('trash-button');

    trashButton.addEventListener('click', function () {
      let confirmation = confirm(`Apakah Anda yakin ingin menghapus buku ${bookObject.title} ?`);

      if (confirmation) {
        removeBookCompleted(bookObject.id);
      }
    });

    const groupingBtn = document.createElement('div');
    groupingBtn.append(checkButton, trashButton);
    groupingBtn.classList.add('group-btn');

    container.append(groupingBtn);
  }

  function removeBookCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function undoBookCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  return container;
}

function addBookCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

const myCheckbox = document.getElementById('inputBookIsComplete');
const bookStatus = document.getElementById('statusBuku');

// Menambahkan event listener ke elemen
myCheckbox.addEventListener('change', function() {
  if (myCheckbox.checked) {
    bookStatus.innerText = 'Selesai dibaca';
  } else {
    bookStatus.innerText = 'Belum Selesai dibaca';
  }
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}




const searchInput = document.getElementById("searchInput");
const incompleteList = document.getElementById("incompleteBookshelfList");
const completeList = document.getElementById("completeBookshelfList");

searchInput.addEventListener("input", displayData);

function displayData() {
  const query = searchInput.value.toLowerCase();
  const filteredBooks = books.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(query);
    const authorMatch = item.author.toLowerCase().includes(query);
    const yearMatch = item.year.toString().includes(query); // Ubah tahun menjadi string sebelum mencocokkan

    // Return true jika salah satu informasi cocok dengan query
    return titleMatch || authorMatch || yearMatch;
  });

  incompleteList.innerHTML = ""; // Bersihkan tabel sebelum menambahkan hasil baru
  completeList.innerHTML = ""; // Bersihkan tabel sebelum menambahkan hasil baru

  filteredBooks.forEach(item => {
    const card = makeTodo(item)
    console.log(item.title);
    
    if (item.isCompleted) {
      completeList.appendChild(card);
    } else {
      incompleteList.appendChild(card);
    }
  });
}

