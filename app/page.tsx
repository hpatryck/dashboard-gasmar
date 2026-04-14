"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, ShieldAlert, Gauge, AlertTriangle, CheckCircle, Thermometer, Droplets, Menu, X, Home, History, Download, Filter, Zap } from 'lucide-react';

export default function DashboardGasmar() {
  const [dados, setDados] = useState<any[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [telaAtiva, setTelaAtiva] = useState<'dashboard' | 'historico'>('dashboard');

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
  const tensao = atual?.tensao ?? 0;

  const isUtCritico = espessuraUT > 0 && espessuraUT < 4;
  const isUtAlerta = espessuraUT >= 4 && espessuraUT < 6;
  const isErCritico = desgasteER > 80;
  const isErAlerta = desgasteER > 50 && desgasteER <= 80;

  // Função para formatar a hora (Eixo X e Tooltip) - Versão segura para TypeScript
  const formatarHora = (valor: any) => {
    if (!valor) return "";
    const data = new Date(valor);
    if (isNaN(data.getTime())) return valor; 
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatarDataCurta = (valor: any) => {
    if (!valor) return "";
    const data = new Date(valor);
    if (isNaN(data.getTime())) return valor;
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  };

  const navegarPara = (tela: 'dashboard' | 'historico') => {
    setTelaAtiva(tela);
    setMenuAberto(false);
  };

  // Função para exportar os dados em CSV
  const exportarCSV = () => {
    if (dados.length === 0) return alert("Não há dados para exportar.");
    const cabecalho = ["Data/Hora", "Espessura UT (mm)", "Desgaste UT (%)", "Desgaste Sonda ER (%)", "Temperatura (C)", "Umidade (%)", "Tensao VSYS (V)"];
    const linhas = dados.map(d => [
      new Date(d.criado_em).toLocaleString('pt-BR'),
      d.espessura_mm?.toFixed(2),
      d.desgaste_percentual?.toFixed(2),
      d.desgaste_er_percentual?.toFixed(2),
      d.temperatura?.toFixed(2),
      d.umidade?.toFixed(2),
      d.tensao?.toFixed(2)
    ].join(","));
    const csvContent = "\uFEFF" + [cabecalho.join(","), ...linhas].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Relatorio_GASMAR_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      
      {/* MENU LATERAL */}
      {menuAberto && (
        <div className="fixed inset-0 bg-blue-950/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setMenuAberto(false)} />
      )}
      
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <Image src="/gasmar_logo.png" alt="Logo GASMAR" width={100} height={35} className="object-contain" />
          <button onClick={() => setMenuAberto(false)} className="text-slate-400 hover:text-blue-900 transition-colors">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 flex-1 flex flex-col gap-2">
          <button onClick={() => navegarPara('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-colors ${telaAtiva === 'dashboard' ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'}`}>
            <Home size={20} /> Dashboard Principal
          </button>
          <button onClick={() => navegarPara('historico')} className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-colors ${telaAtiva === 'historico' ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'}`}>
            <History size={20} /> Histórico Completo
          </button>
        </nav>
        <div className="p-4 text-xs text-center text-slate-400 border-t border-slate-100">GASMAR Telemetria v2.0</div>
      </div>

      <div className="p-4 md:p-8">
        {/* Cabeçalho */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-6">
            <button onClick={() => setMenuAberto(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-blue-900 rounded-lg transition-colors">
              <Menu size={28} />
            </button>
            <div className="hidden sm:block">
              <Image src="/gasmar_logo.png" alt="Logo GASMAR" width={140} height={50} className="object-contain" priority />
            </div>
            <div className="border-l-2 border-slate-200 pl-6 hidden md:block">
              <h1 className="text-2xl font-bold text-blue-900 tracking-tight">
                {telaAtiva === 'dashboard' ? 'Monitoramento de Corrosão' : 'Análise Histórica de Desgaste'}
              </h1>
              <p className="text-emerald-600 font-medium text-sm">Sistema Híbrido: Transdutor UT + Sonda ER + Clima</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="flex flex-col items-end gap-1 bg-emerald-50 px-5 py-2.5 rounded-lg border border-emerald-100 text-emerald-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold">Pico W Online</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <Zap size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">VSYS: {tensao.toFixed(2)}V</span>
              </div>
            </div>
          </div>
        </div>

        {telaAtiva === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm ${isUtCritico ? 'border-red-300 bg-red-50' : isUtAlerta ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:shadow-md'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                      <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Transdutor UT</p>
                      <p className="text-xs font-bold text-blue-600 mt-1">Desgaste: {desgasteUT.toFixed(1)}%</p>
                  </div>
                  <Activity className={isUtCritico ? "text-red-500" : "text-blue-900"} size={24} />
                </div>
                <p className={`text-4xl font-bold tracking-tight ${isUtCritico ? 'text-red-700' : 'text-slate-800'}`}>{espessuraUT.toFixed(1)} <span className="text-lg font-medium text-slate-400">mm</span></p>
                {isUtCritico && <p className="mt-4 text-red-600 text-sm flex items-center gap-1.5 font-bold"><ShieldAlert size={16}/> Risco de ruptura</p>}
                {isUtAlerta && <p className="mt-4 text-amber-600 text-sm flex items-center gap-1.5 font-bold"><AlertTriangle size={16}/> Desgaste acelerado</p>}
                {!isUtCritico && !isUtAlerta && espessuraUT > 0 && <p className="mt-4 text-emerald-600 text-sm flex items-center gap-1.5 font-bold"><CheckCircle size={16}/> Espessura Segura</p>}
              </div>

              <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm ${isErCritico ? 'border-orange-300 bg-orange-50' : isErAlerta ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white hover:shadow-md'}`}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Sonda de Resistência</p>
                  <Gauge className={isErCritico ? "text-orange-500" : "text-orange-500"} size={24} />
                </div>
                <p className={`text-4xl font-bold tracking-tight ${isErCritico ? 'text-orange-700' : 'text-slate-800'}`}>{desgasteER.toFixed(1)} <span className="text-lg font-medium text-slate-400">%</span></p>
                {isErCritico && <p className="mt-4 text-orange-600 text-sm flex items-center gap-1.5 font-bold"><ShieldAlert size={16}/> Perda de massa severa</p>}
                {isErAlerta && <p className="mt-4 text-amber-600 text-sm flex items-center gap-1.5 font-bold"><AlertTriangle size={16}/> Corrosão ativa</p>}
                {!isErCritico && !isErAlerta && desgasteER >= 0 && atual && <p className="mt-4 text-emerald-600 text-sm flex items-center gap-1.5 font-bold"><CheckCircle size={16}/> Corrosão Controlada</p>}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Temp. Ambiente</p>
                  <div className="p-2 bg-rose-50 rounded-lg"><Thermometer className="text-rose-500" size={20} /></div>
                </div>
                <p className="text-4xl font-bold text-slate-800 tracking-tight">{temperatura.toFixed(1)} <span className="text-lg font-medium text-slate-400">°C</span></p>
                <p className="mt-4 text-slate-400 text-sm font-medium">Sensor AHT10</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">Umidade Relativa</p>
                  <div className="p-2 bg-cyan-50 rounded-lg"><Droplets className="text-cyan-500" size={20} /></div>
                </div>
                <p className="text-4xl font-bold text-slate-800 tracking-tight">{umidade.toFixed(1)} <span className="text-lg font-medium text-slate-400">%</span></p>
                <p className="mt-4 text-slate-400 text-sm font-medium">Fator de oxidação</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
                <h2 className="text-lg font-bold text-blue-900 mb-6">Curva de Redução de Espessura (UT)</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dados}>
                    <defs>
                      <linearGradient id="colorEspec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#003366" stopOpacity={0.15}/><stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="criado_em" stroke="#94a3b8" tickFormatter={formatarHora} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickMargin={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit="mm" domain={[0, 14]} tick={{ fill: '#64748b', fontWeight: 500 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} labelFormatter={formatarHora} />
                    <Area type="monotone" dataKey="espessura_mm" name="Espessura" stroke="#003366" strokeWidth={3} fillOpacity={1} fill="url(#colorEspec)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
                <h2 className="text-lg font-bold text-blue-900 mb-6">Correlação Multi-Sonda de Corrosão (%)</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dados}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="criado_em" stroke="#94a3b8" tickFormatter={formatarHora} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} tickMargin={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit="%" domain={[0, 100]} tick={{ fill: '#64748b', fontWeight: 500 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} labelFormatter={formatarHora} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line type="monotone" dataKey="desgaste_percentual" name="UT" stroke="#003366" strokeWidth={3} dot={{ r: 4, fill: '#003366' }} />
                    <Line type="monotone" dataKey="desgaste_er_percentual" name="ER" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {telaAtiva === 'historico' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"><Filter size={16} /> Filtros</button>
              <button onClick={exportarCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors w-full sm:w-auto justify-center"><Download size={16} /> Exportar CSV</button>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm h-[600px] flex flex-col">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-800">Espessura residual — histórico (mm)</h2>
                <p className="text-slate-500 text-sm mt-1">Análise de degradação estrutural do tanque.</p>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="criado_em" stroke="#94a3b8" tickFormatter={formatarDataCurta} tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={16} />
                    <YAxis stroke="#94a3b8" fontSize={13} unit=" mm" domain={['dataMin - 0.2', 'dataMax + 0.2']} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} labelFormatter={formatarHora} />
                    <Line type="monotone" dataKey="espessura_mm" name="Espessura" stroke="#003366" strokeWidth={4} activeDot={{ r: 8 }} dot={{ r: 4, fill: '#003366' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}