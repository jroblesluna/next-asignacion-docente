import assigmentService from '@/services/assigment';
import { useState } from 'react';
import { replacePHWithHH } from '../utils/managmentWords';

interface EscenarioInterfaz {
  escenario: string;
  activo: boolean;
}

export const EscenarioBase: React.FC<EscenarioInterfaz> = ({ escenario, activo }) => {
  const [activoEscenario, setActivoEscenario] = useState<boolean>(activo);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const updateEscenarios = async () => {
    setIsUpdating(true); // Indica que está en proceso de actualización.
    try {
      const result = await assigmentService.updateEscenario(escenario);
      console.log(result.data);
      if (result.data !== false) {
        setActivoEscenario((prev) => !prev); // Cambia el estado solo si la operación es exitosa.
      }
    } catch (error) {
      console.error('Error actualizando el escenario:', error);
      // Opcional: muestra un mensaje de error al usuario.
    } finally {
      setIsUpdating(false); // Finaliza el estado de actualización.
    }
  };

  return (
    <div className="flex flex-row gap-3">
      <p>
        <span className="font-bold">Escenario: </span> {replacePHWithHH(escenario)}
      </p>
      <p>
        <span className="font-bold"> Estado: </span>
        <span>{activoEscenario ? 'Activo' : 'No Activo'}</span>
      </p>
      <input
        type="checkbox"
        checked={activoEscenario} // Usa `checked` en lugar de `defaultChecked`.
        className="checkbox"
        disabled={isUpdating} // Deshabilita mientras se actualiza.
        onChange={updateEscenarios} // Maneja el evento `onChange`.
      />
    </div>
  );
};
