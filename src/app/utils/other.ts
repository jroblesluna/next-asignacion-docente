export const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

export function extraerPalabraEntreParentesis(cadena: string): string | null {
  const match = cadena.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}

export function roundToNearestQuarter(num: number): number {
  const nearest = Math.round(num / 0.25) * 0.25;

  // Si está a menos de 0.01 del múltiplo más cercano, lo aproximamos
  if (Math.abs(num - nearest) <= 0.01) {
    return parseFloat(nearest.toFixed(2));
  }

  // Si no, lo dejamos como está
  return parseFloat(num.toFixed(2));
}
