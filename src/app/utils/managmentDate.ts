interface MonthDetails {
  period: string;
  startDate: string;
  endDate: string;
}

export const getCurrentMonthDetails = (): MonthDetails => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return {
    period: `${startDate.toLocaleString('default', { month: 'long' })} del ${year}`,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

export function convertDateFormat(dateString: string): string {
  const [day, month, year] = dateString.split('/').map(Number);

  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;

  return formattedDate;
}

export function getSeparatedDate(dateStr: string): {
  day: number;
  month: number;
  year: number;
} {
  const [dayStr, monthStr, yearStr] = dateStr.split('/');

  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const year = parseInt(yearStr, 10);

  return { day, month, year };
}

export function convertirFormatoFecha(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function convertirFecha(codigo: string) {
  const codigoStr = codigo.toString();
  const año = codigoStr.slice(0, 4);
  const mesNumero = parseInt(codigoStr.slice(4, 6), 10);

  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const mesNombre = meses[mesNumero - 1];

  return `${mesNombre} del ${año}`;
}
