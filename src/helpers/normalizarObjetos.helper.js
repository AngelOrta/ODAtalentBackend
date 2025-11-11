// Normalizar undefined → null
export default function normalizarObjetosUndefinedANull(obj) {
  return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, value === undefined ? null : value])
        );
}