export function convertToCustomAcronym(phrase: string): string {
  const acronymMap: Record<string, string> = {
    vacaciones: 'VAC',
    'descanso médico': 'DM',
  };

  const normalizedPhrase = phrase.toLowerCase();

  if (normalizedPhrase.includes('licencia')) {
    return 'LIC';
  }

  return acronymMap[normalizedPhrase] || phrase;
}

type Sede = {
  idSede: number;
  NombreSede: string;
  FT: number;
  PT: number;
  Ratio: number;
};

export const ordenarSedes = (sedes: Sede[], ordenDeseado: string[]): Sede[] => {
  return sedes.sort((a, b) => {
    const indexA = ordenDeseado.indexOf(a.NombreSede);
    const indexB = ordenDeseado.indexOf(b.NombreSede);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
};
