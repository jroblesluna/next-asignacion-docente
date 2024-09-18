import React, { createContext, useState, ReactNode } from 'react';

interface Assignment {
  assignmentId: string;
  isRoomClosed: boolean;
  isTeacherClosed: boolean;
  location: string;
  course: string;
  schedule: string;
  frequency: string;
  classroom: string;
  teacher: string;
  numberOfStudents: number;
  // valor inicial? de room y teacher?
}

interface AssignmentContextInterface {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  modifications: string[];
  setModifications: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ContextAssignmentReport = createContext<AssignmentContextInterface>({
  assignments: [],
  setAssignments: () => {},
  modifications: [],
  setModifications: () => {},
});

export const ContextAssignmentReportProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  //datos de prueba , consumirlos a través del api

  const [modifications, setModifications] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      assignmentId: '4',
      isRoomClosed: false,
      isTeacherClosed: true,
      location: 'LIMA',
      course: 'G7H8I9',
      schedule: '10:00 - 13:00',
      frequency: 'LMV',
      classroom: '110',
      teacher: 'RODRIGUEZ CASTILLO, JUAN PABLO',
      numberOfStudents: 28,
    },
    {
      assignmentId: '5',
      isRoomClosed: false,
      isTeacherClosed: true,
      location: 'MIRAFLORES',
      course: 'J1K2L3',
      schedule: '15:00 - 18:00',
      frequency: 'LMV',
      classroom: '500',
      teacher: 'PEREZ LOPEZ, ANA MARIA',
      numberOfStudents: 22,
    },
    {
      assignmentId: '6',
      isRoomClosed: false,
      isTeacherClosed: false,
      location: 'SURCO',
      course: 'M4N5O6',
      schedule: '13:00 - 16:00',
      frequency: 'SD',
      classroom: '310',
      teacher: 'GONZALEZ REYES, MARTIN EDUARDO',
      numberOfStudents: 30,
    },
    {
      assignmentId: '7',
      isRoomClosed: false,
      isTeacherClosed: true,
      location: 'ICA',
      course: 'P7Q8R9',
      schedule: '9:00 - 12:00',
      frequency: 'MJ',
      classroom: '215',
      teacher: 'MORALES GUTIERREZ, LUIS ALFREDO',
      numberOfStudents: 35,
    },
    {
      assignmentId: '8',
      isRoomClosed: false,
      isTeacherClosed: false,
      location: 'LIMA',
      course: 'S1T2U3',
      schedule: '11:00 - 14:00',
      frequency: 'LV',
      classroom: '405',
      teacher: 'CASTRO VASQUEZ, SONIA ESTHER',
      numberOfStudents: 27,
    },
    {
      assignmentId: '9',
      isRoomClosed: false,
      isTeacherClosed: false,
      location: 'LIMA',
      course: 'V4W5X6',
      schedule: '16:00 - 19:00',
      frequency: 'D',
      classroom: '202',
      teacher: '-',
      numberOfStudents: 40,
    },
    {
      assignmentId: '10',
      isRoomClosed: false,
      isTeacherClosed: false,
      location: 'PUCALLPA',
      course: 'Y7Z8A9',
      schedule: '18:00 - 21:00',
      frequency: 'SD',
      classroom: '610',
      teacher: 'DIAZ NUÑEZ, CARMEN ROSA',
      numberOfStudents: 31,
    },
    {
      assignmentId: '11',
      isRoomClosed: false,
      isTeacherClosed: true,
      location: 'BREÑA',
      course: 'B1C2D3',
      schedule: '7:00 - 10:00',
      frequency: 'LMV',
      classroom: '140',
      teacher: 'ORTEGA VILLANUEVA, MIGUEL ANGEL',
      numberOfStudents: 20,
    },
    {
      assignmentId: '12',
      isRoomClosed: false,
      isTeacherClosed: false,
      location: 'INDEPENDENCIA',
      course: 'E4F5G6',
      schedule: '13:00 - 16:00',
      frequency: 'LV',
      classroom: '215',
      teacher: 'SUAREZ ARCE, JULIO CESAR',
      numberOfStudents: 38,
    },
    {
      assignmentId: '13',
      isRoomClosed: false,
      isTeacherClosed: false,
      location: 'LA MOLINA',
      course: 'H7I8J9',
      schedule: '8:00 - 11:00',
      frequency: 'LV',
      classroom: '420',
      teacher: 'MENDOZA LUNA, FERNANDA MARIA',
      numberOfStudents: 26,
    },
  ]);
  return (
    <ContextAssignmentReport.Provider
      value={{ assignments, setAssignments, modifications, setModifications }}
    >
      {children}
    </ContextAssignmentReport.Provider>
  );
};
