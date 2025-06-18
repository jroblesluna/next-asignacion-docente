export const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

export function extraerPalabraEntreParentesis(cadena: string): string | null {
  const match = cadena.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}
