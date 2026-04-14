import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    // 1. Recebendo a nova chave "tensao"
    const { esp_ut, desg_ut, desg_er, temp, umid, tensao } = await request.json();

    if (esp_ut === undefined || desg_ut === undefined || desg_er === undefined) {
       return NextResponse.json({ error: 'Faltam dados no pacote JSON' }, { status: 400 });
    }

    // 2. Inserindo a tensão no banco de dados
    await sql`
      INSERT INTO leituras_sensor (espessura_mm, desgaste_percentual, desgaste_er_percentual, temperatura, umidade, tensao) 
      VALUES (${esp_ut}, ${desg_ut}, ${desg_er}, ${temp || 0}, ${umid || 0}, ${tensao || 0})
    `;
    
    return NextResponse.json({ message: 'Sucesso' }, { status: 201 });
  } catch (error) {
    console.error("Erro no POST:", error);
    return NextResponse.json({ error: 'Erro no POST' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // 3. Buscando a tensão no histórico
    const dados = await sql`
      SELECT id, espessura_mm, desgaste_percentual, desgaste_er_percentual, temperatura, umidade, tensao, criado_em 
      FROM leituras_sensor 
      ORDER BY criado_em DESC 
      LIMIT 20
    `;
    
    return NextResponse.json(dados);
  } catch (error) {
    console.error("Erro no GET:", error);
    return NextResponse.json({ error: 'Erro no GET - Verifique as colunas' }, { status: 500 });
  }
}