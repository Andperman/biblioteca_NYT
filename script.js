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
                  <p>Weeks on list: ${book.weeks_on_list}</p>
                  <p>Description: ${book.description || 'No hay descripción disponible.'}</p>
                  <img src="${book.book_image}" alt="${book.title}" />
                  <a href="${book.amazon_product_url}" target="_blank" class="buy-button" >Comprar en Amazon</a>
              `;
      //Añado una estrella si el usuario está logado 
      const user = auth.currentUser;
      if (user) {
        const favoriteButton = document.createElement('button');
        favoriteButton.textContent = '⭐';
        favoriteButton.addEventListener('click', () => {
          addToFavorites(book.title, user.email);
        });

        bookItem.appendChild(favoriteButton);
      }
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


/* -----------------------------FIREBASE-------------------------*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-storage.js";
import { updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js";

// Configuración de Firebase
let firebaseConfig = {
  apiKey: "AIzaSyAUvIKU2cDhCNJjoBDuofvzliZOz0IpcjA",
  authDomain: "demoweb-9bffc.firebaseapp.com",
  projectId: "demoweb-9bffc",
  storageBucket: "demoweb-9bffc.appspot.com",
  messagingSenderId: "871348645073",
  appId: "1:871348645073:web:f31a8a47cdd694c97f69f0"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage();



const signUpForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout');
const userData = document.getElementById('user-data');


// Función para mostrar datos del usuario
function displayUserData(user) {
  const docRef = doc(db, "users", user.email);
  getDoc(docRef).then(docSnap => {
    if (docSnap.exists()) {
      userData.style.cssText = 'background-color: #73AB84; width: 50%; margin: 2rem auto; padding: 1rem; border-radius: 5px; display: flex; flex-direction: column; align-items: center';
      userData.innerHTML = `<h3>User Data</h3>
                                  <p>Username: ${docSnap.data().username}</p>
                                  <p>Email: ${docSnap.data().email}</p>
                                  <img src="${docSnap.data().profile_picture}" alt="User profile picture">`;
      // Mostrar favoritos
      displayFavorites(user.email);
    }
  });
}

// Función para añadir a favoritos
async function addToFavorites(bookTitle, userEmail) {
  const favoritesRef = doc(db, "users", userEmail);

  try {
    await updateDoc(favoritesRef, {
      favorites: arrayUnion(bookTitle)
    });
    console.log(`Added ${bookTitle} to favorites.`);

    // Mostrar alerta
    alert(`${bookTitle} guardado en favoritos!`);

    // Actualizar el perfil para mostrar los nuevos favoritos
    displayFavorites(userEmail);
  } catch (error) {
    console.error('Error adding to favorites:', error);
  }
}


// Función para mostrar los libros favoritos
async function displayFavorites(userEmail) {
  const favoritesRef = doc(db, "users", userEmail);
  const docSnap = await getDoc(favoritesRef);

  if (docSnap.exists()) {
    const userFavorites = docSnap.data().favorites || [];
    const favoritesList = document.getElementById('user-favorites'); // Asegúrate de tener un elemento en el DOM para mostrar los favoritos
    favoritesList.innerHTML = ''; // Limpiar la lista de favoritos

    userFavorites.forEach(title => {
      const favoriteItem = document.createElement('p');
      favoriteItem.textContent = title; // Mostrar el título del libro
      favoritesList.appendChild(favoriteItem);
    });
  } else {
    console.log("No such document!");
  }
}


// Función para registrar un nuevo usuario
if (document.body.contains(signUpForm)) {
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const signUpEmail = document.getElementById('signup-email').value;
    const signUpPassword = document.getElementById('signup-pass').value;
    const signUpUser = document.getElementById('signup-user').value;
    const signUpImg = document.getElementById('signup-picture').files[0];
    const storageRef = ref(storage, signUpImg.name);
    //Se crea una referencia en Firebase Storage para la imagen del usuario, nombrada como el archivo original 
    //(signUpImg.name). Esto permite almacenar 
    //la imagen de perfil en una ruta específica en el almacenamiento.

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      console.log('User registered');
      signUpForm.reset();

      await uploadBytes(storageRef, signUpImg);
      const publicImageUrl = await getDownloadURL(storageRef);

      await setDoc(doc(collection(db, "users"), signUpEmail), {
        username: signUpUser,
        email: signUpEmail,
        profile_picture: publicImageUrl
      });
      console.log("Document written in Firestore");
    } catch (error) {
      console.log('Error: ', error);
    }
  });
}

// Función para iniciar sesión
if (document.body.contains(loginForm)) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginEmail = document.getElementById('login-email').value;
    const loginPassword = document.getElementById('login-pass').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      console.log('User authenticated');
      loginForm.reset();
      displayUserData(userCredential.user);
    } catch (error) {
      document.getElementById('msgerr').innerHTML = 'Invalid user or password';
      console.log('Error: ', error);
    }
  });
}

// Función para cerrar sesión 
if (document.body.contains(logoutButton)) {
  logoutButton.addEventListener('click', () => {
    const confirmation = confirm("¿Desea salir del perfil?");
    if (confirmation) {
      signOut(auth).then(() => {
        console.log('User logged out');
        userData.style.cssText = '';
        userData.innerHTML = '';
        // Vaciar libros fav
        const favoritesList = document.getElementById('user-favorites');
        if (favoritesList) {
          favoritesList.innerHTML = '';
        }
      }).catch((error) => {
        console.log('Error: ', error);
      });
    }
  });
}

// Función para observar el estado de autenticación
function observeAuthState() {
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('Logged user');
      displayUserData(user);
    } else {
      console.log('No logged user');
      userData.style.cssText = '';
      userData.innerHTML = '';
    }
  });
}

observeAuthState();
