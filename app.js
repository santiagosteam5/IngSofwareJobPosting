const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { TwitterApi } = require('twitter-api-v2');
const connection = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Configuración del cliente de Twitter
const twitterClient = new TwitterApi({
    appKey: 'Pe64K8HXYyCgEArWhQrzY7tj0',
    appSecret: 'CqVf2xX3yuYdOXDQP7JyOYZjMlTdCMy8pzqGHmIqLlttDsR0xS',
    accessToken: '1854748052176715778-2cQ2GDmN0DG5F5St1HAH0lDevFGSm0',
    accessSecret: 'ZBIuu6WeVCF5Mhk6NH8qLO6MbQHrj3YaSNPeRXZkpq6yn'
});

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = ?`;
    connection.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error querying MySQL:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(401).send('User not found');
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        res.status(match ? 200 : 401).send(match ? 'Login successful' : 'Invalid password');
    });
});

// Ruta para registrar un nuevo usuario
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const checkUserQuery = `SELECT * FROM users WHERE username = ?`;
    connection.query(checkUserQuery, [username], (err, results) => {
        if (err) {
            console.error('Error checking existing user:', err);
            return res.status(500).send('Error registering user');
        }

        if (results.length > 0) {
            return res.status(409).send('User already exists');
        }

        const insertUserQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        connection.query(insertUserQuery, [username, email, hashedPassword], (err) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).send('Error registering user');
            }
            res.status(200).send('User registered successfully');
        });
    });
});

// Ruta para publicar un post en Twitter
app.post('/publishToTwitter', async (req, res) => {
    const { title, description } = req.body;

    try {
        const tweetContent = `${title}\n\n${description}`;
        await twitterClient.v1.tweet(tweetContent);
        res.status(200).send('Post published to Twitter successfully');
    } catch (error) {
        console.error('Error publishing to Twitter:', error);
        res.status(500).send('Error publishing to Twitter');
    }
});

// Ruta para obtener todos los posts del usuario
app.get('/myPosts', (req, res) => {
    const username = req.query.username;
    const query = `SELECT * FROM posts WHERE username = ?`;
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error retrieving posts:', err);
            return res.status(500).send('Server error');
        }
        res.status(200).json(results);
    });
});

// Ruta para crear un nuevo post
app.post('/createPost', (req, res) => {
    const { title, description, network, template, fontSize, textColor, username } = req.body;

    if (!title || !description || !username) {
        return res.status(400).send('All fields are required');
    }

    const query = `INSERT INTO posts (title, description, network, template, fontSize, textColor, username) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [title, description, network, template, fontSize, textColor, username], (err) => {
        if (err) {
            console.error('Error creating post:', err);
            return res.status(500).send('Error creating post');
        }
        res.status(200).send('Post created successfully');
    });
});

// Nueva ruta para marcar un post como publicado en el feed público
app.post('/publishPost', (req, res) => {
    const { id } = req.body;
    const query = `UPDATE posts SET published = 1 WHERE id = ?`;
    connection.query(query, [id], (err) => {
        if (err) {
            console.error('Error al publicar el post:', err);
            return res.status(500).send('Error al publicar el post');
        }
        res.status(200).send('Post publicado con éxito');
    });
});

// Nueva ruta para obtener todos los posts publicados en el feed público
app.get('/allPosts', (req, res) => {
    const query = `SELECT username, title, description FROM posts WHERE published = 1`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving all published posts:', err);
            return res.status(500).send('Server error');
        }
        res.status(200).json(results);
    });
});

// Ruta para editar un post existente
app.put('/editPost/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, network, template, fontSize, textColor } = req.body;
    const query = `UPDATE posts SET title = ?, description = ?, network = ?, template = ?, fontSize = ?, textColor = ? WHERE id = ?`;
    connection.query(query, [title, description, network, template, fontSize, textColor, id], (err) => {
        if (err) {
            console.error('Error updating post:', err);
            return res.status(500).send('Error updating post');
        }
        res.status(200).send('Post updated successfully');
    });
});

// Ruta para eliminar un post
app.delete('/deletePost/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM posts WHERE id = ?`;
    connection.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting post:', err);
            return res.status(500).send('Error deleting post');
        }
        res.status(200).send('Post deleted successfully');
    });
});

// Iniciar el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
