import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Conecta ao banco usando a senha que a Vercel já gerou para você
    const sql = neon(process.env.DATABASE_URL);
    
    // 1. Recebe o pacote JSON da Pico W
    const body = await request.json();
    const { distancia_cm } = body;

    // Verifica se a placa enviou a distância corretamente
    if (distancia_cm === undefined) {
      return NextResponse.json({ error: 'Dado inválido' }, { status: 400 });
    }

    // 2. Insere a leitura na sua tabela do banco
    await sql`
      INSERT INTO leituras_sensor (distancia_cm) 
      VALUES (${distancia_cm});
    `;

    // 3. Responde para a placa que deu tudo certo
    return NextResponse.json({ message: 'Leitura registrada com sucesso!' }, { status: 201 });
    
  } catch (error) {
    console.error("Erro no banco:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Busca as últimas 20 leituras para o gráfico
    const dados = await sql`
      SELECT id, distancia_cm, data_leitura 
      FROM leituras_sensor 
      ORDER BY data_leitura DESC 
      LIMIT 20
    `;

    return NextResponse.json(dados);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}