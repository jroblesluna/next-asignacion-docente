import ExcelJS, { Workbook, Worksheet } from 'exceljs';
import { saveAs } from 'file-saver';

import { ProgramacionAcademica, tacData } from '../interface/datainterface';
import { timeDaily, timeWeekend } from '../constants/data';
import { containsDaysOfWeek, isTimeInRange } from './managmentTime';

export const handleDownload = (
  data: ProgramacionAcademica[],
  nameSheet: string,
  nameDoc: string
): void => {
  const workbook: Workbook = new ExcelJS.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet(nameSheet);

  // Definir los encabezados
  worksheet.columns = [
    { header: 'Identificador Unico', key: 'uuuidProgramacionAcademica', width: 40 },
    { header: 'ID Curso', key: 'idCurso', width: 10 },
    { header: 'Código Curso', key: 'codigoCurso', width: 15 },
    { header: 'Nombre Sede', key: 'nombreSede', width: 20 },
    { header: 'Sede Alojada', key: 'sedeAlojada', width: 20 },
    { header: 'Profesor', key: 'NombreCompletoProfesor', width: 40 },
    { header: 'Horario Inicio', key: 'HorarioInicio', width: 15 },
    { header: 'Horario Fin', key: 'HorarioFin', width: 15 },
    { header: 'Frecuencia', key: 'NombreFrecuencia', width: 15 },
    { header: 'Matriculados', key: 'matriculados', width: 12 },
    { header: 'Inicio Clase', key: 'inicioClase', width: 15 },
    { header: 'Final Clase', key: 'finalClase', width: 15 },
    { header: 'Aula', key: 'idAula', width: 10 },
  ];

  // Agregar los datos
  data.forEach((item) => {
    worksheet.addRow({
      uuuidProgramacionAcademica: item.uuuidProgramacionAcademica,
      idCurso: item.idCurso,
      codigoCurso: item.codigoCurso,
      nombreSede: item.nombreSede,
      sedeAlojada: item.nombreSedeAlojada || 'NO ASIGNADO',
      NombreCompletoProfesor: item.NombreCompletoProfesor || 'NO ASIGNADO',
      HorarioInicio: item.HorarioInicio,
      HorarioFin: item.HorarioFin,
      NombreFrecuencia: item.NombreFrecuencia,
      matriculados: item.matriculados,
      inicioClase: item.inicioClase,
      finalClase: item.finalClase,
      idAula: item.identificadorFisico || 'SIN ASIGNAR',
    });
  });

  // Aplicar estilos a las cabeceras
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7CE407' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Aplicar bordes a todas las celdas
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Generar el archivo Excel y descargarlo
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, `${nameDoc}.xlsx`);
  });
};

// Función para descargar el archivo Excel
export const downloadExcelTac = (data: tacData[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Teacher Assignment Report');

  // Agregar cabeceras
  worksheet.columns = [
    { header: '#', width: 5 },
    { header: 'Docente', width: 40 },
    { header: 'Sede', width: 20 },
    { header: 'Estado', width: 10 },
    ...timeDaily.map((time) => ({ header: time, width: 15 })),
    ...timeWeekend.map((time) => ({ header: time, width: 15 })),
    { header: 'Clases Totales', width: 10 },
  ];
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Agregar datos
  let i = 1;
  data.forEach(({ classSchedule, location, status, teacher }) => {
    const rowData: (string | number)[] = [i, teacher, location, status];
    i++;

    // Obtener clases diarias
    timeDaily.forEach((time) => {
      const dailyClasses =
        classSchedule
          .filter(
            (classItem) =>
              isTimeInRange(time, classItem.schedule) &&
              containsDaysOfWeek(classItem.frecuency)
          )
          .map((classItem) => classItem.room)
          .join('/') || ''; // Cadena vacía si no hay clases
      rowData.push(dailyClasses);
    });

    // Obtener clases de fin de semana
    timeWeekend.forEach((time) => {
      const weekendClasses =
        classSchedule
          .filter(
            (classItem) =>
              isTimeInRange(time, classItem.schedule) &&
              !containsDaysOfWeek(classItem.frecuency)
          )
          .map((classItem) => classItem.room)
          .join('/') || ''; // Cadena vacía si no hay clases
      rowData.push(weekendClasses);
    });

    const totalClasses = classSchedule.length;

    // Agregar la fila con los datos
    rowData.push(totalClasses);
    worksheet.addRow(rowData);
  });

  const lastRowIndex = worksheet.lastRow!.number;
  worksheet.getRow(lastRowIndex).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7CE407' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Generar el archivo Excel y descargarlo
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Teacher_Assignment_Report.xlsx');
  });
};
