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
  idAulaInicial: number;
  matriculados: number;
  inicioClase: string;
  finalClase: string;
  vigente: boolean;
  cancelado: boolean;
  uidIdIntensidadFase: string;
  aulaModificada: string | null;
  docenteModificado: string | null;
  tiempoModificado: string;
  NombreCompletoProfesor: string;
  HorarioInicio: string;
  HorarioFin: string;
  NombreFrecuencia: string;
  NombreAgrupFrecuencia: string;
  identificadorFisico: string;
  identificadorFisicoinicial: string;
  idSedeAlojada: number;
  nombreSedeAlojada: string;
  codigoCurso: string;
  nombreSede: string;
}

export interface Assignment {
  assignmentId: string;
  isRoomClosed: string | null;
  isTeacherClosed: string | null;
  location: string;
  course: string;
  schedule: string;
  frequency: string;
  classroom: string;
  identificadorFisicoinicial: string;
  classroomId: string;
  classroomIdInitial: string;
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
  eventoIndisponible: string;
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
  aulaModificada: string | null;
  docenteModificado: string | null;
  tiempoModificado: string;
  HorarioInicio: string;
  HorarioFin: string;
  NombreFrecuencia: string;
  NombreAgrupFrecuencia: string;
  codigoCurso: string;
  minutosCurso: number;
  EstadoDisponible: string;
  eventoIndisponible: string;
}

export interface classSchedule {
  frecuency: string;
  schedule: string;
  room: string;
  minutosCurso: number;
}

export interface tacData {
  teacher: string;
  location: string;
  status: string;
  classSchedule: classSchedule[];
  EstadoDisponible: string;
  eventoIndisponible: string;
}

export interface versionData {
  nombreCreador: string;
  fecha: string;
  fechaHora: string;
  idVersion: string;
}

export interface ratioData {
  idSede: number;
  NombreSede: string;
  FT: number;
  PT: number;
  Ratio: number;
}

export interface balanceDataInterface {
  idDocente: number;
  HorarioInicio: string;
  HorarioFin: string;
  NombreFrecuencia: string;
  NombreAgrupFrecuencia: string;
  idSedeAlojada: number;
  nombreSedeAlojada: string;
  nombreSede: string;
  minutosCurso: number;
  carga: number;
}

export interface esquemaFrecuenciaHorario {
  frecuencia: string;
  horario: string;
}

export interface interfaceEscenario {
  escenario: string;
  activo: boolean;
}

export interface EventoData {
  date: string;
  time: string;
  description: string;
  name: string;
  estado: boolean;
}
