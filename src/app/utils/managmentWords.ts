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
  // Filtramos las sedes que están en ordenDeseado y las que no lo están.
  const sedesEnOrdenDeseado = sedes.filter((sede) => ordenDeseado.includes(sede.NombreSede));
  // Filtramo por sede lima y provincias
  // Ordenamos las sedes que están en ordenDeseado según el orden de ordenDeseado.
  sedesEnOrdenDeseado.sort(
    (a, b) => ordenDeseado.indexOf(a.NombreSede) - ordenDeseado.indexOf(b.NombreSede)
  );

  const sedesLima = sedesEnOrdenDeseado.filter(
    (sede) => !sede.NombreSede.includes('Provincia')
  );
  const sedesProvincia = sedesEnOrdenDeseado.filter((sede) =>
    sede.NombreSede.includes('Provincia')
  );

  const sedesNoEnOrdenDeseado = sedes.filter(
    (sede) => !ordenDeseado.includes(sede.NombreSede)
  );

  // Ahora dividimos las sedes no en ordenDeseado en dos grupos: con "Provincia" y sin "Provincia"
  const sedesConProvincia = sedesNoEnOrdenDeseado.filter((sede) =>
    sede.NombreSede.includes('Provincia')
  );
  const sedesSinProvincia = sedesNoEnOrdenDeseado.filter(
    (sede) => !sede.NombreSede.includes('Provincia')
  );

  // Ordenamos las sedes sin "Provincia" alfabéticamente.
  sedesSinProvincia.sort((a, b) => a.NombreSede.localeCompare(b.NombreSede));

  // Finalmente, unimos los tres grupos: sedes en ordenDeseado, sedes sin "Provincia", y sedes con "Provincia".
  return [...sedesLima, ...sedesSinProvincia, ...sedesProvincia, ...sedesConProvincia];
};

export function replacePHWithHH(input: string): string {
  return input.replace(/PH/g, 'HH');
}
