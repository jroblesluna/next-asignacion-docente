export interface ProgramacionAcademica {
  indice: number;
  uuuidProgramacionAcademica: string;
  idVersion: number;
  idPeriodo: number;
  idSede: number;
  idCurso: number;
  idHorario: number;
  idFrecuencia: number;
  idDocente: number;
  idAula: number;
  matriculados: number;
  inicioClase: string;
  finalClase: string;
  vigente: boolean;
  cancelado: boolean;
  uidIdIntensidadFase: string;
  aulaModificada: boolean;
  docenteModificado: boolean;
  tiempoModificado: string;
  NombreCompletoProfesor: string;
  HorarioInicio: string;
  HorarioFin: string;
  NombreFrecuencia: string;
  identificadorFisico: string;
  idSedeAlojada: number;
  nombreSedeAlojada: string;
  codigoCurso: string;
  nombreSede: string;
}

export interface Assignment {
  assignmentId: string;
  isRoomClosed: boolean;
  isTeacherClosed: boolean;
  location: string;
  course: string;
  schedule: string;
  frequency: string;
  classroom: string;
  teacher: string;
  teacherId: string;
  numberOfStudents: number;
  isEditable: boolean;
}

export interface PeriodoAcademico {
  idPeriodo: number;
  tiempoCreado: string;
  fechaInicio: string;
  fechaFinal: string;
  estado: string;
}

export interface DocentesActivos {
  DocenteID: number;
  uidIdDocente: string;
  codigodocente: number;
  DocumentoIdentidad: number;
  EmailCoorporativo: string;
  FechaIngreso: string;
  FechaInicioContrato: string;
  FechaFinContrato: string;
  NombreCompletoProfesor: string;
  TipoContratoID: number;
  FlagVigente: boolean;
  SedeID: number;
  NombreSede: string;
  NombreAgrupSede: string;
  FlagVigenteSede: boolean;
  Seguimiento: number;
  TipoJornada: string;
  EstadoDisponible: number;
}

export interface docentesTac {
  uuidDocente: string;
  NombreSede: string;
  NombreCompletoProfesor: string;
  TipoJornada: string;
  indice: number;
  uuuidProgramacionAcademica: string;
  idVersion: number;
  idPeriodo: number;
  idSede: number;
  idCurso: number;
  idHorario: number;
  idFrecuencia: number;
  idDocente: number;
  idAula: number;
  matriculados: number;
  inicioClase: string;
  finalClase: string;
  vigente: boolean;
  cancelado: boolean;
  uidIdIntensidadFase: string;
  aulaModificada: boolean;
  docenteModificado: boolean;
  tiempoModificado: string;
  HorarioInicio: string;
  HorarioFin: string;
  NombreFrecuencia: string;
  codigoCurso: string;
}

export interface classSchedule {
  frecuency: string;
  schedule: string;
  room: string;
}

export interface tacData {
  teacher: string;
  location: string;
  status: string;
  classSchedule: classSchedule[];
}

export interface versionData {
  nombreCreador: string;
  fecha: string;
  idVersion: string;
}
