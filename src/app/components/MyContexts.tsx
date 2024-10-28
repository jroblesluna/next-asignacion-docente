import React, { createContext, useState, ReactNode } from 'react';
import { Assignment } from '../interface/datainterface';

interface AssignmentContextInterface {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  modifications: string[];
  setModifications: React.Dispatch<React.SetStateAction<string[]>>;
  // repensar las set modification
  versionID: string;
  setVersionID: React.Dispatch<React.SetStateAction<string>>;
  LastVersionID: string;
  setLastVersionID: React.Dispatch<React.SetStateAction<string>>;
  period: string;
  setPeriod: React.Dispatch<React.SetStateAction<string>>;
}

export const ContextAssignmentReport = createContext<AssignmentContextInterface>({
  assignments: [],
  setAssignments: () => {},
  modifications: [],
  setModifications: () => {},
  versionID: '',
  setVersionID: () => {},
  LastVersionID: '',
  setLastVersionID: () => {},
  period: '',
  setPeriod: () => {},
});

export const ContextAssignmentReportProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modifications, setModifications] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [period, setPeriod] = useState<string>('');
  const [LastVersionID, setLastVersionID] = useState<string>('');
  const [versionID, setVersionID] = useState<string>('');

  return (
    <ContextAssignmentReport.Provider
      value={{
        assignments,
        setAssignments,
        modifications,
        setModifications,
        LastVersionID,
        period,
        setLastVersionID,
        setPeriod,
        setVersionID,
        versionID,
      }}
    >
      {children}
    </ContextAssignmentReport.Provider>
  );
};
