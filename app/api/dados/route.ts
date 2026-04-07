import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { distancia_cm } = await request.json();
    // Aqui usamos o nome correto: criado_em (geralmente preenchido pelo DEFAULT do banco)
    await sql`INSERT INTO leituras_sensor (distancia_cm) VALUES (${distancia_cm})`;
    return NextResponse.json({ message: 'Sucesso' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro no POST' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    // Ajustado para buscar a coluna 'criado_em'
    const dados = await sql`
      SELECT id, distancia_cm, criado_em 
      FROM leituras_sensor 
      ORDER BY criado_em DESC 
      LIMIT 20
    `;
    return NextResponse.json(dados);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro no GET - Verifique as colunas' }, { status: 500 });
  }
}