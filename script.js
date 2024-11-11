// Función de login
async function loginUser(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username && password) {
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                alert('Login successful!');
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', username);
                window.location.href = 'home.html';
            } else {
                const error = await response.text();
                alert('Login failed: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error logging in.');
        }
    } else {
        alert('Please fill in all fields.');
    }
}

// Función para registrar un usuario
async function registerUser(event) {
    event.preventDefault();
    console.log("Register button clicked"); // Confirmación en la consola

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (username && email && password) {
        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                alert('User registered successfully!');
                window.location.href = 'index.html';
            } else {
                const error = await response.text();
                alert('Registration failed: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error registering.');
        }
    } else {
        alert('Please fill in all fields.');
    }
}

// Función para crear un post
async function createPost(event) {
    event.preventDefault();

    const postData = {
        title: document.getElementById('jobTitle').value,
        description: document.getElementById('jobDescription').value,
        network: document.getElementById('socialNetwork').value,
        template: document.getElementById('template').value,
        fontSize: document.getElementById('fontSize').value,
        textColor: document.getElementById('textColor').value,
        username: localStorage.getItem('username')
    };

    try {
        const response = await fetch('http://localhost:3000/createPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            alert('Post created successfully!');
            window.location.href = 'my_posts.html';
        } else {
            const error = await response.text();
            alert('Failed to create post: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating post.');
    }
}

// Función para cargar los posts del usuario
async function loadUserPosts() {
    const username = localStorage.getItem('username');
    try {
        const response = await fetch(`http://localhost:3000/myPosts?username=${username}`);
        const posts = await response.json();
        const postList = document.getElementById('postList');

        postList.innerHTML = posts.map(post => `
            <div class="post-item" id="post-${post.id}">
                <h3>${post.title}</h3>
                <p>${post.description}</p>
                <button onclick="editPost(${post.id})">Edit</button>
                <button onclick="deletePost(${post.id})">Delete</button>
                <button onclick="publishToTwitter(${post.id})">Publish to Twitter</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}


// Función para editar un post
async function editPost(postId) {
    const updatedData = {
        title: prompt('Enter new title:'),
        description: prompt('Enter new description:'),
        network: prompt('Enter new social network (e.g., Twitter, Instagram):'),
        template: prompt('Enter new template:'),
        fontSize: prompt('Enter new font size:'),
        textColor: prompt('Enter new text color (hex code):')
    };

    try {
        const response = await fetch(`http://localhost:3000/editPost/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert('Post updated successfully!');
            loadUserPosts();
        } else {
            const error = await response.text();
            alert('Failed to update post: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating post.');
    }
}

// Función para eliminar un post
async function deletePost(postId) {
    const confirmDelete = confirm('Are you sure you want to delete this post?');

    if (confirmDelete) {
        try {
            const response = await fetch(`http://localhost:3000/deletePost/${postId}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Post deleted successfully!');
                loadUserPosts();
            } else {
                const error = await response.text();
                alert('Failed to delete post: ' + error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting post.');
        }
    }
}

// Función de logout
function logout() {
    localStorage.clear();
    alert('You have been logged out.');
    window.location.href = 'index.html';
}

// Funciones de navegación
function navigateToMyPosts() {
    window.location.href = 'my_posts.html';
}

function navigateToCreatePost() {
    window.location.href = 'create_post.html';
}
async function publishToTwitter(title, description) {
    try {
        const response = await fetch('http://localhost:3000/publishToTwitter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            alert('Post published to Twitter successfully!');
        } else {
            const error = await response.text();
            alert('Failed to publish to Twitter: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error publishing to Twitter.');
    }
}
function publishPost(postId) {
    fetch('http://localhost:3000/publishPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: postId })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        // Puedes recargar la lista de posts o actualizar el estado del botón si deseas
    })
    .catch(error => {
        console.error('Error publishing post:', error);
        alert('Failed to publish post');
    });
}
function navigateToAllPosts() {
    window.location.href = "all_posts.html";
}
// Función para cargar todos los posts publicados en la página "all_posts.html"
function loadAllPosts() {
    fetch("http://localhost:3000/allPosts")
        .then(response => response.json())
        .then(posts => {
            const postsContainer = document.getElementById("posts-container");
            postsContainer.innerHTML = ""; // Limpiar el contenedor

            posts.forEach(post => {
                // Crear el contenedor de la tarjeta de post
                const postCard = document.createElement("div");
                postCard.classList.add("post-card");

                // Añadir el nombre de usuario como título
                const postTitle = document.createElement("h3");
                postTitle.textContent = post.username;

                // Añadir el contenido del post
                const postDescription = document.createElement("p");
                postDescription.textContent = post.description;

                // Agregar título y descripción a la tarjeta
                postCard.appendChild(postTitle);
                postCard.appendChild(postDescription);

                // Añadir la tarjeta al contenedor de posts
                postsContainer.appendChild(postCard);
            });
        })
        .catch(error => console.error("Error loading posts:", error));
}
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('show'); // Muestra/oculta el menú
}

// Configurar el evento para que funcione al hacer clic en el ícono de menú
document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.querySelector('.menu-icon');
    menuIcon.addEventListener('click', toggleMenu);
});
// Función para mostrar la vista previa de la imagen
function previewImage(event) {
    const image = document.getElementById('imagePreview');
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            image.src = e.target.result;
            image.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        image.src = '';
        image.style.display = 'none';
    }
}

// Función para crear un nuevo post
async function createPost(event) {
    event.preventDefault();

    const postData = {
        title: document.getElementById('jobTitle').value,
        description: document.getElementById('jobDescription').value,
        network: document.getElementById('socialNetwork').value,
        template: document.getElementById('template').value,
        fontSize: document.getElementById('fontSize').value,
        textColor: document.getElementById('textColor').value,
        username: localStorage.getItem('username') // Este valor debe estar definido al iniciar sesión
    };

    if (!postData.username) {
        alert('Error: Please log in before creating a post.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/createPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            alert('Post created successfully!');
            window.location.href = 'my_posts.html';
        } else {
            const error = await response.text();
            alert('Failed to create post: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating post.');
    }
}


// Función para guardar el post (simulación de guardado)
function savePost(postData) {
    // Aquí puedes hacer una llamada a un servidor o manejar el guardado localmente.
    console.log("Post creado:", postData);
    alert("Post creado exitosamente");
    // Aquí puedes añadir el código para mostrar el post en la interfaz o redirigir
}




