// la funcion esta modificada para que tenga tolerancia dos  minutos en el final y 10 minutos al inicio
export function isTimeInRange(time: string, range: string): boolean {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const [startTime, endTime] = range.split(' - ').map(timeToMinutes);
  const timeInMinutes = timeToMinutes(time);

  return timeInMinutes >= startTime - 10 && timeInMinutes <= endTime - 2;
}

export function evaluateExpression(a: number, b: string, operator: string): boolean {
  const operatorM = operator === '=' ? '===' : operator;
  const expression = `${a} ${operatorM} ${b}`;
  return eval(expression);
}

export function containsDaysOfWeek(input: string): boolean {
  const days = ['L', 'M', 'J', 'V'];
  return days.some((day) => input.includes(day));
}

export const getCurrentDateTimeLima = (): string => {
  const limaTime = new Date().toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return limaTime.replace(',', '');
};
