import ExcelJS, { Workbook, Worksheet } from 'exceljs';
import { saveAs } from 'file-saver';

import { ProgramacionAcademica } from '../interface/datainterface';

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
