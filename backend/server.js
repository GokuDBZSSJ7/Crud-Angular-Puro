const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path')
const fs = require('fs');
const multer = require('multer')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crud_db'
});

async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado ao MySQL com sucesso!');
    connection.release();
  } catch (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  }
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

app.use('/uploads', express.static(uploadsDir));

checkConnection();

async function setupDatabase() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        preco DECIMAL(10, 2) NOT NULL,
        descricao TEXT NOT NULL,
        categoria_id INT NOT NULL,
        imagem_url VARCHAR(2000),
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
      )
    `);

    console.log('Tabelas verificadas/criadas com sucesso!');
  } catch (err) {
    console.error('Erro ao configurar banco de dados:', err);
  }
}

setupDatabase();

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categorias');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { nome } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO categorias (nome) VALUES (?)',
      [nome]
    );

    const [newCategory] = await pool.execute(
      'SELECT * FROM categorias WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newCategory[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM categorias WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { nome } = req.body;
    const [result] = await pool.execute(
      'UPDATE categorias SET nome = ? WHERE id = ?',
      [nome, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const [updatedCategory] = await pool.execute(
      'SELECT * FROM categorias WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedCategory[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT COUNT(*) as count FROM produtos WHERE categoria_id = ?',
      [req.params.id]
    );

    if (products[0].count > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir esta categoria pois existem produtos associados a ela'
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM categorias WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    res.json({ message: 'Categoria removida com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, c.nome as categoria_nome 
      FROM produtos p
      JOIN categorias c ON p.categoria_id = c.id
    `);

    const products = rows.map(row => ({
      id: row.id,
      nome: row.nome,
      preco: row.preco,
      descricao: row.descricao,
      categoriaId: row.categoria_id,
      imagemUrl: row.imagem_url,
      categoria: {
        id: row.categoria_id,
        nome: row.categoria_nome
      }
    }));

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { nome, preco, descricao, categoriaId, imagem_url } = req.body;
    console.log('BODY:', req.body);

    const [result] = await pool.execute(
      'INSERT INTO produtos (nome, preco, descricao, categoria_id, imagem_url) VALUES (?, ?, ?, ?, ?)',
      [nome, preco, descricao, categoriaId, imagem_url || null]
    );

    const [rows] = await pool.execute(`
      SELECT p.*, c.nome as categoria_nome 
      FROM produtos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [result.insertId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Erro ao recuperar o produto criado' });
    }

    const product = {
      id: rows[0].id,
      nome: rows[0].nome,
      preco: rows[0].preco,
      descricao: rows[0].descricao,
      categoriaId: rows[0].categoria_id,
      imagem_url: rows[0].imagem_url,
      categoria: {
        id: rows[0].categoria_id,
        nome: rows[0].categoria_nome
      }
    };

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const {
      nome,
      preco,
      imagem_url,
      descricao,
      categoriaId
    } = req.body;
    const [result] = await pool.execute(
      'UPDATE produtos SET nome = ?, preco = ?, imagem_url = ?, descricao = ?, categoria_id = ? WHERE id = ?',
      [nome, preco, imagem_url, descricao, categoriaId, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrada' });
    }

    const [updatedProduct] = await pool.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedProduct[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM produtos WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado' });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ imagePath });
});

app.get("/api/productsCategory/:id", async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM produtos WHERE categoria_id = ?',
      [req.params.id]
    );

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
