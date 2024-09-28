import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  console.log("GET@/app/api/period/get/[id]/route.ts");
  const { id } = params;

  if (!id) {
    return NextResponse.json({
      message: 'ID de periodo académico no proporcionado',
      data: false,
    });
  }

  try {
    const pool = await connectToDatabase();

    const result = await pool
      .request()
      .input('id', id)
      .query('SELECT * FROM Periodo WHERE idPeriodo  = @id');

    if (!result) {
      return NextResponse.json({
        message: `Perido con ${id} no  encontrada `,
        data: false,
      });
    }

    pool.close();

    return NextResponse.json({
      message: 'Período encontrado correctamente',
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
