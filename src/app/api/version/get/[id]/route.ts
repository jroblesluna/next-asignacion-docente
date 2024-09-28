import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  console.log("GET@/app/api/version/get/[id]/route.ts");
  const { id } = params;

  if (!id) {
    return NextResponse.json({
      message: 'ID de versión académico no proporcionado',
      data: false,
    });
  }

  try {
    const pool = await connectToDatabase();

    const result = await pool
      .request()
      .input('id', id)
      .query('SELECT * FROM Version WHERE idVersion  = @id');

    pool.close();

    if (!result) {
      return NextResponse.json({
        message: `Versión con ${id} no  encontrada `,
        data: false,
      });
    }

    return NextResponse.json({
      message: 'Versión encontrada correctamente',
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json({ message: 'Error en la consulta', error }, { status: 500 });
  }
}
