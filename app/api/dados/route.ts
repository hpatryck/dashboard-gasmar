import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { esp_ut, desg_ut, desg_er, temp, umid } = await request.json();

    // Trava de segurança principal
    if (esp_ut === undefined || desg_ut === undefined || desg_er === undefined) {
       return NextResponse.json({ error: 'Faltam dados no pacote JSON' }, { status: 400 });
    }

    // Inserindo os 5 dados! (Usamos || 0 caso o AHT10 falhe e mande vazio)
    await sql`
      INSERT INTO leituras_sensor (espessura_mm, desgaste_percentual, desgaste_er_percentual, temperatura, umidade) 
      VALUES (${esp_ut}, ${desg_ut}, ${desg_er}, ${temp || 0}, ${umid || 0})
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
    
    // Agora buscamos a temperatura e a umidade também
    const dados = await sql`
      SELECT id, espessura_mm, desgaste_percentual, desgaste_er_percentual, temperatura, umidade, criado_em 
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