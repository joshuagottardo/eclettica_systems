import express from "express";
import pool from "./db.js";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const IMMAGINI_ROOT = "/volume1/eclettica_systems/immagini";
const ARTICOLI_DIR = path.join(IMMAGINI_ROOT, "articoli");
const ESTENSIONI_FOTO = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "HEIC",
  "HEIF",
  "avif",
  "svg",
];
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.get("/api/articoli/:id/foto/:tipo", (req, res) => {
  const { id, tipo } = req.params;
  for (const ext of ESTENSIONI_FOTO) {
    const filePath = path.join(ARTICOLI_DIR, id, `${tipo}.${ext}`);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  // Se non trova nessun file:
  res.status(404).json({ found: false });
});

// Serve le immagini statiche come prima
app.use("/immagini/articoli", express.static(ARTICOLI_DIR));

// Serve the React app (test purpose)
app.get("/api/test", (req, res) => {
  res.json({ message: "API funzionante!" });
});

// Select all names from the 'materiale' table
app.get("/api/materiali", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT nome FROM materiale ORDER BY nome ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Select all articles from the 'articolo' table
app.get("/api/articoli", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        articolo.id,
        articolo.nome,
        articolo.tipo,
        articolo.numero_pezzi,
        articolo.altezza,
        articolo.punta,
        articolo.tacco,
        articolo.accessori,
        azienda.nome AS nome_azienda,
        azienda.brand AS brand_azienda
      FROM articolo
      LEFT JOIN azienda ON articolo.id_azienda = azienda.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Select all companies from the 'azienda' table
app.get("/api/aziende", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, brand FROM azienda ORDER BY nome ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Errore durante il recupero delle aziende:", err);
    res.status(500).json({ error: "Errore nel recupero delle aziende" });
  }
});

// Get details of a specific article by ID
app.get("/api/articoli/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        a.id,
        a.nome,
        a.tipo,
        a.numero_pezzi,
        a.altezza,
        a.punta,
        a.tacco,
        a.accessori,
        az.nome AS nome_azienda,
        az.brand AS brand_azienda
      FROM articolo a
      LEFT JOIN azienda az ON a.id_azienda = az.id
      WHERE a.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Articolo non trovato" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel caricamento dettagli articolo" });
  }
});

// API: Inserimento nuovo articolo
app.post("/api/articoli", upload.any(), async (req, res) => {
  try {
    const {
      nome,
      tipo,
      numero_pezzi,
      altezza,
      punta,
      tacco,
      accessori,
      azienda,
    } = req.body;

    const materiali = req.body["materiali[]"]
      ? Array.isArray(req.body["materiali[]"])
        ? req.body["materiali[]"]
        : [req.body["materiali[]"]]
      : [];

    // Validazione base
    if (!nome) {
      return res.status(400).json({ error: "Dati obbligatori mancanti" });
    }

    // Cast
    const nomeVal = nome?.trim();
    const tipoVal = tipo?.trim() || null;
    const numeroPezziVal =
      numero_pezzi && !isNaN(parseInt(numero_pezzi))
        ? parseInt(numero_pezzi)
        : null;
    const altezzaVal =
      altezza && !isNaN(parseInt(altezza)) ? parseInt(altezza) : null;
    const puntaVal = punta?.trim() || null;
    const taccoVal = tacco?.trim() || null;
    const accessoriVal = accessori?.trim() || null;
    const aziendaVal =
      azienda && !isNaN(parseInt(azienda)) ? parseInt(azienda) : null;

    // Inserimento articolo
    const [result] = await pool.query(
      `
  INSERT INTO articolo
  (nome, tipo, numero_pezzi, altezza, punta, tacco, accessori, id_azienda)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
      [
        nomeVal,
        tipoVal,
        numeroPezziVal,
        altezzaVal,
        puntaVal,
        taccoVal,
        accessoriVal,
        aziendaVal,
      ]
    );

    const id_articolo = result.insertId;

    // Inserimento materiali nella tabella ponte
    for (const id_materiale of materiali) {
      const materialeInt = parseInt(id_materiale, 10);
      await pool.query(
        `INSERT INTO articolo_materiale (id_articolo, id_materiale) VALUES (?, ?)`,
        [id_articolo, materialeInt]
      );
    }

    // Cartella immagine
    const dir = path.join(ARTICOLI_DIR, id_articolo.toString());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Salvataggio immagini
    for (const file of req.files) {
      const match = file.fieldname.match(/^immagine_(.+)$/);
      if (!match) continue;
      const tipo = match[1]; // es. "principale", "esterno", ecc.
      const outputPath = path.join(dir, `${tipo}.jpg`);

      await sharp(file.buffer).jpeg({ quality: 85 }).toFile(outputPath);
    }

    res.json({ success: true, id: id_articolo });
  } catch (err) {
    console.error("Errore nel salvataggio articolo:", err);
    res
      .status(500)
      .json({ error: "Errore durante il salvataggio dell'articolo" });
  }
});

app.listen(PORT, () =>
  console.log(`API in ascolto su http://localhost:${PORT}`)
);
