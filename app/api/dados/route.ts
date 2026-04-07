export const dynamic = 'force-dynamic';

import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    const { distancia_cm } = body;

    if (distancia_cm === undefined) {
      return NextResponse.json({ error: 'Dado inválido' }, { status: 400 });
    }

    await sql`INSERT INTO leituras_sensor (distancia_cm) VALUES (${distancia_cm})`;
    return NextResponse.json({ message: 'Sucesso' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const dados = await sql`
      SELECT id, distancia_cm, data_leitura 
      FROM leituras_sensor 
      ORDER BY data_leitura DESC 
      LIMIT 20
    `;
    return NextResponse.json(dados);
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}