import { z } from "zod";

export const ArticoloSchema = z.object({
  id: z.number().int().optional(),
  codice: z.string().min(1),
  azienda: z.string().optional(),
  stato_produzione: z.string().optional(),
  citta_produzione: z.string().optional(),
  tipologia: z.enum(["ceppo", "ceppo tacco", "zeppa"]),
  punta: z.enum(["tonda", "punta", "quadra"]),
  altezza_tacco: z.number().min(0).max(300),
  numero_pezzi: z.number().int().min(0).max(10),
  accessorio: z.string().optional(),
  forma_matricola: z.string().optional(),
  forma_id_azienda: z.number().optional(),
  azienda_forma: z.string().optional(),
  materiali: z.array(z.string()).optional(),
  finitura: z.string().optional()
});
