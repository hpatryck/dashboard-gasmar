"use client";
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Database, Droplets, AlertTriangle } from 'lucide-react';

export default function DashboardGasmar() {
  const [dados, setDados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados da nossa API
const fetchDados = async () => {
    try {
      // Adicionamos o { cache: 'no-store' } para forçar a atualização
      const res = await fetch('/api/dados', { cache: 'no-store' }); 
      const json = await res.json();
      setDados(json.reverse());
      setLoading(false);
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
  };

  // Atualiza os dados automaticamente a cada 5 segundos
  useEffect(() => {
    fetchDados();
    const intervalo = setInterval(fetchDados, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const ultimaLeitura = dados.length > 0 ? dados[dados.length - 1].distancia_cm : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">GASMAR | Monitoramento</h1>
          <p className="text-slate-400">Sistema de telemetria de corrosão via IoT</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Sistema Online</span>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 font-medium">Última Distância</p>
            <Droplets className="text-blue-400" size={24} />
          </div>
          <p className="text-4xl font-bold">{ultimaLeitura} <span className="text-lg font-normal text-slate-500">cm</span></p>
          <p className="text-xs text-blue-500 mt-2">Atualizado em tempo real</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 font-medium">Status do Duto</p>
            <Activity className="text-green-400" size={24} />
          </div>
          <p className="text-4xl font-bold">{ultimaLeitura < 5 ? 'Alerta' : 'Normal'}</p>
          <p className="text-xs text-slate-500 mt-2">Baseado na espessura captada</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 font-medium">Banco de Dados</p>
            <Database className="text-purple-400" size={24} />
          </div>
          <p className="text-4xl font-bold">{dados.length}</p>
          <p className="text-xs text-slate-500 mt-2">Leituras no buffer atual</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-[400px]">
        <h2 className="text-xl font-semibold mb-6">Histórico de Corrosão (Distância)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados}>
            <defs>
              <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="id" hide />
            <YAxis stroke="#94a3b8" fontSize={12} unit="cm" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Area 
              type="monotone" 
              dataKey="distancia_cm" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorDist)" 
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}