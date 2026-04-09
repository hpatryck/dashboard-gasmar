"use client";
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Database, ShieldAlert, Gauge, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DashboardGasmar() {
  const [dados, setDados] = useState<any[]>([]);

  const fetchDados = async () => {
    try {
      const res = await fetch('/api/dados', { cache: 'no-store' });
      const json = await res.json();
      setDados(json.reverse());
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
  };

  useEffect(() => {
    fetchDados();
    const intervalo = setInterval(fetchDados, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // Pegando os valores da última leitura salva
  const atual = dados.length > 0 ? dados[dados.length - 1] : null;
  const espessuraUT = atual?.espessura_mm ?? 0;
  const desgasteUT = atual?.desgaste_percentual ?? 0;
  const desgasteER = atual?.desgaste_er_percentual ?? 0;

  // Lógica de Alertas de Negócio
  const isUtCritico = espessuraUT > 0 && espessuraUT < 4;
  const isUtAlerta = espessuraUT >= 4 && espessuraUT < 6;
  
  const isErCritico = desgasteER > 80;
  const isErAlerta = desgasteER > 50 && desgasteER <= 80;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">GASMAR | Monitoramento de Corrosão</h1>
          <p className="text-slate-400">Sistema Híbrido: Transdutor UT + Sonda ER</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Conectado à Pico W</span>
        </div>
      </div>

      {/* Grid de Cards (Painéis de Instrumento) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Ultrassom (UT) */}
        <div className={`p-6 rounded-xl border shadow-xl transition-colors duration-500 ${isUtCritico ? 'border-red-500 bg-red-950/20' : 'border-slate-700 bg-slate-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-slate-400 font-medium">Transdutor UT</p>
                <p className="text-sm text-blue-400 font-mono">Desgaste: {desgasteUT.toFixed(1)}%</p>
            </div>
            <Activity className={isUtCritico ? "text-red-500" : "text-blue-400"} size={24} />
          </div>
          <p className="text-4xl font-bold">{espessuraUT.toFixed(1)} <span className="text-lg font-normal text-slate-500">mm</span></p>
          
          {/* Mensagens de Alerta Dinâmicas do UT */}
          {isUtCritico && (
              <p className="mt-3 text-red-400 text-sm flex items-center gap-1 font-semibold"><ShieldAlert size={16}/> CRÍTICO: Risco de ruptura</p>
          )}
          {isUtAlerta && (
              <p className="mt-3 text-yellow-400 text-sm flex items-center gap-1"><AlertTriangle size={16}/> ALERTA: Desgaste acelerado</p>
          )}
          {!isUtCritico && !isUtAlerta && espessuraUT > 0 && (
              <p className="mt-3 text-green-400 text-sm flex items-center gap-1"><CheckCircle size={16}/> Espessura Segura</p>
          )}
        </div>

        {/* Card 2: Sonda ER (Potenciômetro/Joystick) */}
        <div className={`p-6 rounded-xl border shadow-xl transition-colors duration-500 ${isErCritico ? 'border-orange-500 bg-orange-950/20' : 'border-slate-700 bg-slate-800'}`}>
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 font-medium">Sonda de Resistência (ER)</p>
            <Gauge className={isErCritico ? "text-orange-500" : "text-orange-400"} size={24} />
          </div>
          <p className="text-4xl font-bold">{desgasteER.toFixed(1)} <span className="text-lg font-normal text-slate-500">%</span></p>
          
          {/* Mensagens de Alerta Dinâmicas da Sonda ER */}
          {isErCritico && (
              <p className="mt-3 text-orange-500 text-sm flex items-center gap-1 font-semibold"><ShieldAlert size={16}/> CRÍTICO: Perda de massa severa</p>
          )}
          {isErAlerta && (
              <p className="mt-3 text-yellow-400 text-sm flex items-center gap-1"><AlertTriangle size={16}/> ALERTA: Corrosão ativa na sonda</p>
          )}
          {!isErCritico && !isErAlerta && desgasteER >= 0 && atual && (
              <p className="mt-3 text-green-400 text-sm flex items-center gap-1"><CheckCircle size={16}/> Corrosão Controlada</p>
          )}
        </div>

        {/* Card 3: Status Geral e Nuvem */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col justify-between">
          <div>
              <div className="flex justify-between items-start mb-4">
                <p className="text-slate-400 font-medium">Banco Neon</p>
                <Database className="text-purple-400" size={24} />
              </div>
              <p className="text-4xl font-bold">{dados.length}</p>
              <p className="text-sm text-slate-500 mt-1">Leituras no buffer atual</p>
          </div>
          <div className="mt-4">
             {/* Indicador Global de Status da Planta */}
             {(isUtCritico || isErCritico) ? (
                 <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/50">PARADA OBRIGATÓRIA (MANUTENÇÃO)</span>
             ) : (
                 <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/50">OPERAÇÃO NORMAL</span>
             )}
          </div>
        </div>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Espessura Física (UT) */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-[400px]">
          <h2 className="text-xl font-semibold mb-6">Redução de Espessura (UT)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dados}>
              <defs>
                <linearGradient id="colorEspec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="id" hide />
              <YAxis stroke="#94a3b8" fontSize={12} unit="mm" domain={[0, 14]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Area type="monotone" dataKey="espessura_mm" name="Espessura" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEspec)" animationDuration={500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 2: Correlação de Desgaste (UT vs Sonda ER) */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-[400px]">
          <h2 className="text-xl font-semibold mb-6 text-slate-200">Correlação de Corrosão (%)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="id" hide />
              <YAxis stroke="#94a3b8" fontSize={12} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} />
              <Line type="monotone" dataKey="desgaste_percentual" name="Desgaste UT (Físico)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6' }} animationDuration={500} />
              <Line type="monotone" dataKey="desgaste_er_percentual" name="Desgaste ER (Galvânico)" stroke="#f97316" strokeWidth={3} dot={{ r: 3, fill: '#f97316' }} animationDuration={500} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}