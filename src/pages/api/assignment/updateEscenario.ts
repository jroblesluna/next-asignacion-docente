import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    console.log('PATCH@/pages/api/assignment/update-escenario.ts');
    let pool;

    try {
      const { escenario } = req.body;

      pool = await connectToDatabase();

      const result = await pool
        .request()
        .query(`select * from [dbo].[ad_periodo] where estado='CARGANDO'  `);

      const periodoData = result.recordset;

      if (periodoData.length !== 0) {
        return res.status(200).json({
          message: 'No se pudo editar los  escenarios mientras hay un periodo en ejecución',
          data: false,
        });
      }

      const resUpdate = await pool.request().input('escenario', escenario).query(`
                     DECLARE @resultado BIT;
                            
                            BEGIN TRANSACTION;
                            
                            -- Actualizar la tabla
                            UPDATE ad_escenario
                            SET activo = ~activo
                            WHERE escenario = @escenario;
                            
                            -- Verificar si no hay activos
                            IF NOT EXISTS (SELECT 1 FROM ad_escenario WHERE activo = 1)
                            BEGIN
                                -- Revertir la transacción si no hay registros activos
                                ROLLBACK TRANSACTION;
                                SET @resultado = 0; 
                            END
                            ELSE
                            BEGIN
                                -- Confirmar la transacción si hay al menos un activo
                                COMMIT TRANSACTION;
                                SET @resultado = 1; 
                            END
                            
                            -- Retornar el resultado
                            SELECT @resultado AS resultado;`);

      if (resUpdate.recordset[0]?.resultado == 0) {
        return res.status(200).json({
          message: 'No se pudo editar, por que no puede quedar el sistema sin escenarios',
          data: false,
        });
      }
      return res.status(200).json({
        message: `Escenario ${escenario} modificado exitosamente`,
        data: true,
      });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ message: 'Error en la consulta', error });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
