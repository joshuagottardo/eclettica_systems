import express from "express";
import pool from "./db.js";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { ArticoloSchema } from "./models/articolo.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Percorso assoluto della cartella corrente (backend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/.env` });

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

checkEnvVars(["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"]);

// Serve le immagini statiche
app.use("/immagini/articoli", express.static(ARTICOLI_DIR));

app.get("/api/articoli", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const [rows] = await pool.query(`
      SELECT
        a.id,
        a.codice,
        az1.nome AS azienda,
        a.stato_produzione,
        a.citta_produzione,
        a.tipologia,
        a.punta,
        a.altezza_tacco,
        a.numero_pezzi,
        a.accessorio,
        a.serie AS in_serie,
        a.forma_matricola AS matricola_forma,
        a.forma_id_azienda,
        az2.nome AS azienda_forma,
        f.nome AS finitura,
        GROUP_CONCAT(m.nome) AS materiali
      FROM articolo a
      LEFT JOIN azienda az1 ON a.id_azienda = az1.id
      LEFT JOIN azienda az2 ON a.forma_id_azienda = az2.id
      LEFT JOIN finitura f ON a.id_finitura = f.id
      LEFT JOIN articolo_materiale am ON am.id_articolo = a.id
      LEFT JOIN materiale_base m ON am.id_materiale = m.id
      GROUP BY a.id
    `);

    // Validazione (array di articoli)
    const articoliValidi = [];
    for (const row of rows) {
      try {
        // Converte la stringa "materiali" in array, oppure [] se null/vuoto
        row.materiali = row.materiali ? row.materiali.split(",") : [];
        articoliValidi.push(ArticoloSchema.parse(row));
      } catch (err) {
        console.error("Errore di validazione articolo:", {
          dati: row,
          errori: err.errors,
        });
      }
    }

    res.json(articoliValidi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/articoli/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM articolo WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Articolo non trovato" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/articoli/:id/foto/:tipo", (req, res) => {
  res.set("Cache-Control", "no-store");
  const { id, tipo } = req.params;
  for (const ext of ESTENSIONI_FOTO) {
    const filePath = path.join(ARTICOLI_DIR, id, `${tipo}.${ext}`);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  res.status(404).json({ found: false });
});

app.get("/api/test", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ message: "API funzionante!" });
});

// Select all names from the 'materiale' table
app.get("/api/materiali", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const [rows] = await pool.query(
      "SELECT nome FROM materiale_base ORDER BY nome ASC"
    );
    const nomiMateriali = rows.map((row) => row.nome);
    res.json(nomiMateriali);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/finiture", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const [rows] = await pool.query("SELECT nome FROM finitura");
    const finiture = rows.map((row) => row.nome);
    res.json(finiture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Select all companies from the 'azienda' table
app.get("/api/aziende", async (req, res) => {
  res.set("Cache-Control", "no-store");
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
  res.set("Cache-Control", "no-store");
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
      codice,
      tipologia,
      punta,
      altezza_tacco,
      accessorio,
      matricola_forma,
      azienda,
      azienda_forma,
      stato_produzione,
      citta_produzione,
      finitura,
      in_serie,
    } = req.body;

    const materialiRaw = req.body["materiali[]"] || req.body.materiali || [];
    const materiali = Array.isArray(materialiRaw)
      ? materialiRaw
      : [materialiRaw];

    // ✅ Validazione obbligatori
    if (!codice) {
      return res.status(400).json({ error: "Il campo CODICE è obbligatorio." });
    }

    const hasFotoPrincipale = req.files.some(
      (file) => file.fieldname === "immagine_principale"
    );
    if (!hasFotoPrincipale) {
      return res
        .status(400)
        .json({ error: "La foto principale è obbligatoria." });
    }

    // Lookup ID finitura (può anche essere null)
    let id_finitura = null;
    if (finitura) {
      const [rows] = await pool.query(
        "SELECT id FROM finitura WHERE nome = ? LIMIT 1",
        [finitura]
      );
      id_finitura = rows.length ? rows[0].id : null;
    }

    // Cast e pulizia dati
    const codiceVal = codice.trim();
    const tipologiaVal = tipologia?.trim() || null;
    const puntaVal = punta?.trim() || null;
    const altezzaVal =
      altezza_tacco && !isNaN(parseInt(altezza_tacco))
        ? parseInt(altezza_tacco)
        : 0;
    const accessorioVal = accessorio?.trim() || null;
    const matricolaVal = matricola_forma?.trim() || null;
    const aziendaVal = azienda ? parseInt(azienda) : null;
    const aziendaFormaVal = azienda_forma ? parseInt(azienda_forma) : null;
    const statoVal = stato_produzione?.trim() || null;
    const cittaVal = citta_produzione?.trim() || null;

    // Inserimento articolo
    const [result] = await pool.query(
      `
      INSERT INTO articolo
      (codice, tipologia, punta, altezza_tacco, accessorio, forma_matricola, id_azienda, forma_id_azienda, stato_produzione, citta_produzione, id_finitura, serie)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        codiceVal,
        tipologiaVal,
        puntaVal,
        altezzaVal,
        accessorioVal,
        matricolaVal,
        aziendaVal,
        aziendaFormaVal,
        statoVal,
        cittaVal,
        id_finitura,
        in_serie,
      ]
    );

    const id_articolo = result.insertId;

    // Inserimento materiali
    for (const nome_materiale of materiali) {
      const [rows] = await pool.query(
        "SELECT id FROM materiale_base WHERE nome = ? LIMIT 1",
        [nome_materiale]
      );

      if (rows.length) {
        await pool.query(
          `INSERT INTO articolo_materiale (id_articolo, id_materiale) VALUES (?, ?)`,
          [id_articolo, rows[0].id]
        );
      }
    }

    // Salvataggio immagini convertite in JPEG
    const dir = path.join(ARTICOLI_DIR, id_articolo.toString());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    for (const file of req.files) {
      const match = file.fieldname.match(/^immagine_(.+)$/);
      if (!match) continue;
      const tipo = match[1];
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

app.post("/api/stati", async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ error: "Nome stato obbligatorio" });

  const [rows] = await pool.query(
    "SELECT 1 FROM articolo WHERE stato_produzione = ? LIMIT 1",
    [nome]
  );

  if (rows.length) {
    return res.status(409).json({ error: "Stato già esistente" });
  }

  res.json({ success: true });
});

app.post("/api/citta", async (req, res) => {
  const { stato, nome } = req.body;
  if (!stato || !nome) return res.status(400).json({ error: "Dati mancanti" });

  const [rows] = await pool.query(
    "SELECT 1 FROM articolo WHERE stato_produzione = ? AND citta_produzione = ? LIMIT 1",
    [stato, nome]
  );

  if (rows.length) {
    return res
      .status(409)
      .json({ error: "Città già presente per questo stato" });
  }

  res.json({ success: true });
});

app.get("/api/utenti", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const [rows] = await pool.query(
      "SELECT id, nome FROM utente"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero degli utenti" });
  }
});

app.post("/api/verifica-password", async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: "ID e password sono obbligatori" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT password FROM utente WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ valida: false });
    }

    const passwordCorretta = rows[0].password === password;
    res.json({ valida: passwordCorretta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella verifica della password" });
  }
});

function checkEnvVars(requiredVars) {
  let allPresent = true;
  for (const key of requiredVars) {
    if (!process.env[key]) {
      console.error(`Variabile ${key} mancante in .env`);
      allPresent = false;
    }
  }
  if (!allPresent) {
    console.error("Alcune variabili d'ambiente mancanti. Verifica il file .env prima di avviare il server.");
    process.exit(1); // blocca l'avvio per evitare errori a runtime
  }
}

app.listen(PORT, () =>
  console.log(`API in ascolto su http://localhost:${PORT}`)
);
