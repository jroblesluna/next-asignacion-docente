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
      assignmentId: '1',
      isRoomClosed: false,
      isTeacherClosed: false,
      location: 'LIMA',
      course: 'T0S3SV',
      schedule: '9:00 - 12:36',
      frequency: 'LV',
      classroom: '420',
      teacher: 'CARRANZA SIHUAY, CESAR AUGUSTO',
      numberOfStudents: 29,
    },
    {
      assignmentId: '2',
      isRoomClosed: false,
      isTeacherClosed: false,
      location: 'MIRAFLORES',
      course: 'A1B2C3',
      schedule: '14:00 - 17:00',
      frequency: 'MW',
      classroom: '305',
      teacher: '-',
      numberOfStudents: 32,
    },
    {
      assignmentId: '3',
      isRoomClosed: true,
      isTeacherClosed: false,
      location: 'LA MOLINA',
      course: 'D4E5F6',
      schedule: '8:00 - 11:00',
      frequency: 'SD',
      classroom: '212',
      teacher: 'FLORES RAMOS, MARIA LUZ',
      numberOfStudents: 25,
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
