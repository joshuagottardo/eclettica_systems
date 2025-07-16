import { z } from "zod";

const zNumberLike = z.preprocess((val) => {
  if (val === "" || val == null) return null;
  if (!isNaN(val)) return Number(val);
  return val;
}, z.number().nullable());

export const ArticoloSchema = z.object({
  id: zNumberLike,
  codice: z.string().min(1),
  azienda: z.string().nullable().optional(),
  stato_produzione: z.string().nullable().optional(),
  citta_produzione: z.string().nullable().optional(),
  tipologia: z.enum(["ceppo", "ceppo tacco", "zeppa"]).nullable().optional(),
  punta: z.enum(["tonda", "punta", "quadra"]).nullable().optional(),
  altezza_tacco: zNumberLike,
  numero_pezzi: zNumberLike,
  matricola_forma: z.string().nullable().optional(),
  forma_id_azienda: z.number().nullable().optional(),
  azienda_forma: z.string().nullable().optional(),
  materiali: z.array(z.string()).nullable().optional(),
  finitura: z.string().nullable().optional(),
  in_serie: z.preprocess((val) => {
    if (val === "1" || val === 1 || val === true) return 1;
    return 0;
  }, z.number().int()),
});
