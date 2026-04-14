"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, ShieldAlert, Gauge, AlertTriangle, CheckCircle, Thermometer, Droplets, Database, Menu, X, Home, Settings, History, FileText } from 'lucide-react';

export default function DashboardGasmar() {
  const [dados, setDados] = useState<any[]>([]);
  const [menuAberto, setMenuAberto] = useState(false); // Estado para controlar o menu lateral

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

  const atual = dados.length > 0 ? dados[dados.length - 1] : null;
  const espessuraUT = atual?.espessura_mm ?? 0;
  const desgasteUT = atual?.desgaste_percentual ?? 0;
  const desgasteER = atual?.desgaste_er_percentual ?? 0;
  const temperatura = atual?.temperatura ?? 0;
  const umidade = atual?.umidade ?? 0;

  const isUtCritico = espessuraUT > 0 && espessuraUT < 4;
  const isUtAlerta = espessuraUT >= 4 && espessuraUT < 6;
  const isErCritico = desgasteER > 80;
  const isErAlerta = desgasteER > 50 && desgasteER <= 80;

  const formatarHora = (valor: any) => {
    if (!valor) return "";
    const data = new Date(valor);
    if (isNaN(data.getTime())) return valor; 
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      
      {/* ======================= MENU LATERAL (SIDEBAR) ======================= */}
      {/* Fundo escuro que aparece atrás do menu */}
      {menuAberto && (
        <div 
          className="fixed inset-0 bg-blue-950/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMenuAberto(false)}
        />
      )}
      
      {/* A gaveta do menu em si */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <Image src="/gasmar_logo.jpg" alt="Logo GASMAR" width={100} height={35} className="object-contain" />
          <button onClick={() => setMenuAberto(false)} className="text-slate-400 hover:text-blue-900 transition-colors">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 flex-1 flex flex-col gap-2">
          {/* Exemplos de botões para você programar depois */}
          <button className="flex items-center gap-3 w-full p-3 rounded-lg bg-blue-50 text-blue-900 font-medium">
            <Home size={20} /> Dashboard Principal
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-900 transition-colors">
            <History size={20} /> Histórico Completo
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-900 transition-colors">
            <FileText size={20} /> Relatórios PDF
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-900 transition-colors">
            <Settings size={20} /> Configurações
          </button>
        </nav>
        <div className="p-4 text-xs text-center text-slate-400 border-t border-slate-100">
          GASMAR Telemetria v2.0
        </div>
      </div>
      {/* ==================================================================== */}


      <div className="p-4 md:p-8">
        {/* Cabeçalho */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          
          <div className="flex items-center gap-6">
            {/* O Botão de 3 tracinhos (Hambúrguer) */}
            <button 
              onClick={() => setMenuAberto(true)}
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-blue-900 rounded-lg transition-colors"
            >
              <Menu size={28} />
            </button>
            
            {/* Logo e Títulos */}
            <div className="hidden sm:block">
              <Image 
                src="/gasmar_logo.jpg" 
                alt="Logo GASMAR" 
                width={140} 
                height={50} 
                className="object-contain"
                priority
              />
            </div>
            <div className="border-l-2 border-slate-200 pl-6 hidden md:block">
              <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Monitoramento de Corrosão</h1>
              <p className="text-emerald-600 font-medium text-sm">Sistema Híbrido: Transdutor UT + Sonda ER + Clima</p>
            </div>
          </div>

          {/* Indicadores de Status */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 text-blue-800">
              <Database size={16} />
              <span className="text-sm font-semibold">{dados.length} leituras em buffer</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 text-emerald-800">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Pico W Online</span>
            </div>
          </div>
        </div>

        {/* Grid de 4 Cards (UT, ER, Temp, Umidade) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Ultrassom (UT) */}
          <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm ${isUtCritico ? 'border-red-300 bg-red-50' : isUtAlerta ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Transdutor UT</p>
                  <p className="text-xs font-bold text-blue-600 mt-1">Desgaste: {desgasteUT.toFixed(1)}%</p>
              </div>
              <Activity className={isUtCritico ? "text-red-500" : "text-blue-900"} size={24} />
            </div>
            <p className={`text-4xl font-bold tracking-tight ${isUtCritico ? 'text-red-700' : 'text-slate-800'}`}>
              {espessuraUT.toFixed(1)} <span className="text-lg font-medium text-slate-400">mm</span>
            </p>
            {isUtCritico && <p className="mt-4 text-red-600 text-sm flex items-center gap-1.5 font-bold"><ShieldAlert size={16}/> Risco de ruptura</p>}
            {isUtAlerta && <p className="mt-4 text-amber-600 text-sm flex items-center gap-1.5 font-bold"><AlertTriangle size={16}/> Desgaste acelerado</p>}
            {!isUtCritico && !isUtAlerta && espessuraUT > 0 && <p className="mt-4 text-emerald-600 text-sm flex items-center gap-1.5 font-bold"><CheckCircle size={16}/> Espessura Segura</p>}
          </div>

          {/* Card 2: Sonda ER (Joystick) */}
          <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm ${isErCritico ? 'border-orange-300 bg-orange-50' : isErAlerta ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Sonda de Resistência</p>
              <Gauge className={isErCritico ? "text-orange-500" : "text-orange-500"} size={24} />
            </div>
            <p className={`text-4xl font-bold tracking-tight ${isErCritico ? 'text-orange-700' : 'text-slate-800'}`}>
              {desgasteER.toFixed(1)} <span className="text-lg font-medium text-slate-400">%</span>
            </p>
            {isErCritico && <p className="mt-4 text-orange-600 text-sm flex items-center gap-1.5 font-bold"><ShieldAlert size={16}/> Perda de massa severa</p>}
            {isErAlerta && <p className="mt-4 text-amber-600 text-sm flex items-center gap-1.5 font-bold"><AlertTriangle size={16}/> Corrosão ativa</p>}
            {!isErCritico && !isErAlerta && desgasteER >= 0 && atual && <p className="mt-4 text-emerald-600 text-sm flex items-center gap-1.5 font-bold"><CheckCircle size={16}/> Corrosão Controlada</p>}
          </div>

          {/* Card 3: Temperatura (AHT10) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Temp. Ambiente</p>
              <div className="p-2 bg-rose-50 rounded-lg">
                <Thermometer className="text-rose-500" size={20} />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-800 tracking-tight">
              {temperatura.toFixed(1)} <span className="text-lg font-medium text-slate-400">°C</span>
            </p>
            <p className="mt-4 text-slate-400 text-sm font-medium">Sensor AHT10</p>
          </div>

          {/* Card 4: Umidade (AHT10) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Umidade Relativa</p>
              <div className="p-2 bg-cyan-50 rounded-lg">
                <Droplets className="text-cyan-500" size={20} />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-800 tracking-tight">
              {umidade.toFixed(1)} <span className="text-lg font-medium text-slate-400">%</span>
            </p>
            <p className="mt-4 text-slate-400 text-sm font-medium">Fator de oxidação</p>
          </div>

        </div>

        {/* Grid de Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Gráfico 1: Espessura Física (UT) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h2 className="text-lg font-bold text-blue-900 mb-6">Curva de Redução de Espessura (UT)</h2>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dados}>
                <defs>
                  <linearGradient id="colorEspec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003366" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="criado_em" 
                  stroke="#94a3b8" 
                  tickFormatter={formatarHora} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  tickMargin={12}
                />
                <YAxis stroke="#94a3b8" fontSize={12} unit="mm" domain={[0, 14]} tick={{ fill: '#64748b', fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  labelFormatter={formatarHora}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="espessura_mm" name="Espessura" stroke="#003366" strokeWidth={3} fillOpacity={1} fill="url(#colorEspec)" animationDuration={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 2: Correlação de Desgaste (UT vs Sonda ER) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
            <h2 className="text-lg font-bold text-blue-900 mb-6">Correlação Multi-Sonda de Corrosão (%)</h2>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="criado_em" 
                  stroke="#94a3b8" 
                  tickFormatter={formatarHora} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  tickMargin={12}
                />
                <YAxis stroke="#94a3b8" fontSize={12} unit="%" domain={[0, 100]} tick={{ fill: '#64748b', fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  labelFormatter={formatarHora}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '20px' }} iconType="circle" />
                <Line type="monotone" dataKey="desgaste_percentual" name="Desgaste Físico (UT)" stroke="#003366" strokeWidth={3} dot={{ r: 4, fill: '#003366', strokeWidth: 0 }} animationDuration={500} />
                <Line type="monotone" dataKey="desgaste_er_percentual" name="Perda Galvânica (ER)" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} animationDuration={500} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}