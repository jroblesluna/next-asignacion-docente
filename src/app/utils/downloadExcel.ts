import ExcelJS, { Workbook, Worksheet } from 'exceljs';
import { saveAs } from 'file-saver';

import {
  balanceDataInterface,
  esquemaFrecuenciaHorario,
  ProgramacionAcademica,
  ratioData,
  tacData,
} from '../interface/datainterface';
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

export const exportBalance = (
  ratiosData: ratioData[],
  balancaDatarray: balanceDataInterface[],
  filteredSchedules: esquemaFrecuenciaHorario[],
  frecuenciaEquivalenteMap: Record<string, string>,
  periodo: string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('ReporteBalance' + periodo);

  // Configuración de estilos para las celdas de cabecera
  const headerStyle = {
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '062060' }, // Fondo azul oscuro
    },
    font: {
      color: { argb: 'FFFFFF' }, // Texto blanco
      bold: true,
      size: 11,
    },
    alignment: { vertical: 'middle', horizontal: 'center' },
  };

  // Definir las cabeceras con sus anchos
  const columns = [
    { header: 'FRECUENCIA', key: 'frecuencia', width: 15 },
    { header: 'HORARIO', key: 'horario', width: 15 },
    { header: 'TOTAL', key: 'total', width: 10 },
    ...ratiosData.map((item) => ({
      header: item.NombreSede,
      key: `sede_${item.idSede}`,
      width: 20,
    })),
    { header: '', key: 'empty', width: 5 },
    ...ratiosData.map((item) => ({
      header: item.NombreSede,
      key: `ratio_${item.idSede}`,
      width: 20,
    })),
  ];

  worksheet.columns = columns;

  worksheet.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // Add Full Time Row
  const ftRow = [
    '',
    'FULL TIME',
    ratiosData.reduce((acc, item) => acc + item.FT, 0),
    ...ratiosData.map((item) => item.FT),
    '',
    ...ratiosData.map((item) => `${item.Ratio.toFixed(2)}%`),
  ];
  worksheet.addRow(ftRow);

  // Add Part Time Row
  const ptRow = [
    '',
    'PART TIME',
    ratiosData.reduce((acc, item) => acc + item.PT, 0),
    ...ratiosData.map((item) => item.PT),
    balancaDatarray.filter((row) => row.idDocente === null).length,
    '',
  ];
  worksheet.addRow(ptRow);

  // Add Ratio Row
  const totalFTPT = ratiosData.reduce((acc, item) => acc + item.FT + item.PT / 3, 0);
  const ratioRow = [
    '',
    'RATIO',
    totalFTPT.toFixed(2),
    ...ratiosData.map((item) => `${item.Ratio.toFixed(2)}%`),
    '',
    ...ratiosData.map((item) => {
      const cargaMod = balancaDatarray.reduce(
        (acc, row) => (row.nombreSede === item.NombreSede ? acc + row.carga : acc),
        0
      );
      const denom = item.FT + item.PT / 3;
      return denom !== 0 ? (cargaMod / denom).toFixed(2) : '';
    }),
  ];
  worksheet.addRow(ratioRow);

  // Add filtered schedules
  filteredSchedules.forEach((item) => {
    const row = [
      item.frecuencia,
      item.horario,
      balancaDatarray.filter(
        (row) =>
          frecuenciaEquivalenteMap[row.NombreFrecuencia] === item.frecuencia &&
          `${row.HorarioInicio} - ${row.HorarioFin}` === item.horario
      ).length,
      ...ratiosData.map((location) => {
        const count = balancaDatarray.filter(
          (row) =>
            frecuenciaEquivalenteMap[row.NombreFrecuencia] === item.frecuencia &&
            `${row.HorarioInicio} - ${row.HorarioFin}` === item.horario &&
            row.nombreSede === location.NombreSede &&
            row.idDocente !== null
        ).length;
        return count;
      }),
      balancaDatarray.filter(
        (row) =>
          frecuenciaEquivalenteMap[row.NombreFrecuencia] === item.frecuencia &&
          `${row.HorarioInicio} - ${row.HorarioFin}` === item.horario &&
          row.idDocente === null
      ).length,
      ...ratiosData.map((location) => {
        const totalMatches = balancaDatarray.filter(
          (row) =>
            frecuenciaEquivalenteMap[row.NombreFrecuencia] === item.frecuencia &&
            `${row.HorarioInicio} - ${row.HorarioFin}` === item.horario
        ).length;
        if (totalMatches === 0) return '';
        const matchCount = balancaDatarray.filter(
          (row) =>
            frecuenciaEquivalenteMap[row.NombreFrecuencia] === item.frecuencia &&
            `${row.HorarioInicio} - ${row.HorarioFin}` === item.horario &&
            row.nombreSede === location.NombreSede
        ).length;
        return `${((matchCount / totalMatches) * 100).toFixed(2)}%`;
      }),
    ];
    worksheet.addRow(row);
  });

  // Save as Excel file
  workbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(new Blob([buffer]), 'ReporteBalance' + periodo + '.xlsx');
  });
};
