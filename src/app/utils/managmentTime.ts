export function isTimeInRange(time: string, range: string): boolean {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const [startTime, endTime] = range.split(' - ').map(timeToMinutes);
  const timeInMinutes = timeToMinutes(time);

  // Incluye la hora final del rango como válida
  return timeInMinutes >= startTime && timeInMinutes <= endTime + 1;
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
