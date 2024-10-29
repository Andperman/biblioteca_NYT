//Clave api 
const apiKey = 'n2hFHOYmkZlzUPwCEDmEfj9q3fsE97dE';
const booksContainer = document.getElementById('booksContainer'); //principal todos los libros se muestran la lista de los libros 
const loading = document.getElementById('loading'); //muestra mensaje o animación mientras se optiene la información de la API

async function listaTematica() {
  try {
    const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${apiKey}`);
    const data = await response.json();

    // Ocultar la animación de carga
    loading.style.display = 'none';

    // Crear y mostrar las listas
    data.results.forEach(list => {
      const listItem = document.createElement('div');
      listItem.className = 'list-item';
      //El enlace contiene un atributo data-list con el nombre de la lista (list_name), 
      //lo cual podría usarse más adelante para cargar los detalles de esa lista en particular.
      //atributo data-list , para guardar los datos de la lista de libros
      listItem.innerHTML =
        `
                <h2>${list.display_name}</h2>
                <hr>
                <p>Oldest: ${list.oldest_published_date}</p>
                <p>Newest: ${list.newest_published_date}</p>
                <p>Updated: ${list.updated}</p>
                <a href="#" class="READMORE" data-list="${list.list_name}">READ MORE</a>
            `;
      booksContainer.appendChild(listItem);
    });
    booksContainer.addEventListener('click', function (event) {
      if (event.target.classList.contains('READMORE')) {
        event.preventDefault();
        const listName = event.target.getAttribute('data-list');
        verLibros(listName);
      }
    });

  } catch (error) {
    console.error('Error loading books', error);
  }
}

listaTematica();


//2feth

async function verLibros(listName) {

    try {
      const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/${listName}.json?api-key=${apiKey}`);
      const data = await response.json();
  
      booksContainer.innerHTML = '';
      booksContainer.appendChild(backButton);
  
      const bookGroup = document.createElement('div');
      bookGroup.className = 'book-list';

      data.results.books.forEach((book, index) => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.innerHTML = `
                  <h4>#${index + 1} ${book.title}</h4>
                  <p>Semanas en la lista: ${book.weeks_on_list}</p>
                  <p>Descripción: ${book.description || 'No hay descripción disponible.'}</p>
                  <img src="${book.book_image}" alt="${book.title}" />
                  <a href="${book.amazon_product_url}" target="_blank">Comprar en Amazon</a>
              `;
  
        bookGroup.appendChild(bookItem);
      });
  
      booksContainer.appendChild(bookGroup);
  
    } catch (error) {
      console.error('Error loading books', error);
    }
  }
  
  //boton volver
  const backButton = document.createElement('button');
  backButton.textContent = 'Return';
  backButton.className = 'button';
  backButton.addEventListener('click', () => {
    booksContainer.innerHTML = '';
    listaTematica();
  });
  

