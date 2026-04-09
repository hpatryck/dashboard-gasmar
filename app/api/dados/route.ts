import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();
    
    // Recebendo os dados cruzados do Ultrassom (UT) e do Joystick (Sonda ER)
    // O seu amigo precisa garantir que o JSON enviado use EXATAMENTE estes nomes
    const { esp_ut, desg_ut, desg_er } = body;

    // Inserindo na tabela com as novas colunas
    await sql`
      INSERT INTO leituras_sensor (espessura_mm, desgaste_percentual, desgaste_er_percentual) 
      VALUES (${esp_ut}, ${desg_ut}, ${desg_er})
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
    
    // Buscando todos os dados necessários para o novo Dashboard
    const dados = await sql`
      SELECT id, espessura_mm, desgaste_percentual, desgaste_er_percentual, criado_em 
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