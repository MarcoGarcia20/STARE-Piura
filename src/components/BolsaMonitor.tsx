import React, { useState } from 'react';
import { SocialEvent, PiuraDistrict, DonationMethod, BolsaItem } from '../types';
import { 
  BarChart3, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ShoppingBag, 
  ArrowRight, 
  Percent, 
  Plus, 
  CheckCircle,
  HelpCircle,
  Coins,
  History,
  Store,
  ChevronDown,
  X,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CanvasProgress } from '@/components/ui';

import { useEvents } from '../features/events';
import { useDonations } from '../features/donations';
import { useFinance } from '../features/finance';

interface BolsaMonitorProps {
  events?: SocialEvent[];
  selectedEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
  onRegisterDonation?: (
    eventId: string,
    mypeName: string,
    category: string,
    district: PiuraDistrict,
    method: DonationMethod,
    amount?: number,
    itemsDonated?: { itemName: string; qty: number }[]
  ) => void;
  onBalanceInventory?: (eventId: string, maxBudgetAllocated: number) => Promise<{ success: boolean; spent: number; msg: string }> | { success: boolean; spent: number; msg: string };
  availableAcquisitionFund?: number;
}

export const BolsaMonitor: React.FC<BolsaMonitorProps> = ({
  events: propEvents,
  selectedEventId: propSelectedEventId,
  onSelectEvent: propOnSelectEvent,
  onRegisterDonation: propOnRegisterDonation,
  onBalanceInventory: propOnBalanceInventory,
  availableAcquisitionFund: propAvailableFund,
}) => {
  const { events: hookEvents, selectedEventId: hookSelectedId, setSelectedEventId: hookSelectEvent, balanceInventory: hookBalanceInventory } = useEvents();
  const { addDonation: hookRegisterDonation } = useDonations();
  const { balances: hookBalances } = useFinance();

  const events = propEvents || hookEvents;
  const selectedEventId = propSelectedEventId !== undefined ? propSelectedEventId : hookSelectedId;
  const onSelectEvent = propOnSelectEvent || hookSelectEvent;
  const onRegisterDonation = propOnRegisterDonation || hookRegisterDonation;
  const availableAcquisitionFund = propAvailableFund !== undefined ? propAvailableFund : hookBalances.fondoAdquisicion;
  const onBalanceInventory = propOnBalanceInventory || (async (eventId, maxBudget) => {
    return await hookBalanceInventory(eventId, maxBudget, availableAcquisitionFund);
  });
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  // Register Donation Form States
  const [mypeName, setMypeName] = useState('');
  const [mypeCategory, setMypeCategory] = useState('Bodega');
  const [mypeDistrict, setMypeDistrict] = useState<PiuraDistrict>('Piura Centro');
  const [donationMethod, setDonationMethod] = useState<DonationMethod>('Especie');
  const [cashAmount, setCashAmount] = useState('');
  
  // Storing quantities to donate per item
  const [itemQuantities, setItemQuantities] = useState<{ [itemId: string]: number }>({});

  // Balancing budget limit state
  const [maxBudget, setMaxBudget] = useState('');

  // Find currently selected event (or fallback to the first upcoming one)
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const activeEvent = events.find(e => e.id === selectedEventId) || sortedEvents[0];

  if (!activeEvent) {
    return (
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 text-center text-slate-500">
        No se registran eventos activos para auditar en Piura.
      </div>
    );
  }

  // Calculate stats for active event
  const calculateEventCoverage = (event: SocialEvent) => {
    let totalTargetCost = 0;
    let totalCurrentCost = 0;
    let totalTargetItems = 0;
    let totalCurrentItems = 0;

    event.itemsBolsa.forEach(item => {
      totalTargetCost += item.targetQty * item.unitPriceEstimate;
      totalCurrentCost += item.currentQty * item.unitPriceEstimate;
      totalTargetItems += item.targetQty;
      totalCurrentItems += Math.min(item.currentQty, item.targetQty); // cap at target for standard progression bar
    });

    const costPct = totalTargetCost > 0 ? (totalCurrentCost / totalTargetCost) * 100 : 0;
    const itemsPct = totalTargetItems > 0 ? (totalCurrentItems / totalTargetItems) * 100 : 0;
    
    // Total cost deficit (to reach 100% of target value)
    const deficitCost = Math.max(0, totalTargetCost - totalCurrentCost);

    return {
      costPct,
      itemsPct,
      totalTargetCost,
      totalCurrentCost,
      deficitCost,
    };
  };

  const activeStats = calculateEventCoverage(activeEvent);

  // Time remaining calculations
  const today = new Date('2026-06-03'); // Simulated local date in environment metadata
  const eventDate = new Date(activeEvent.date);
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Urgency logic: low coverage (< 50%) and narrow timeline (< 7 days)
  const isUrgent = diffDays <= 7 && activeStats.costPct < 50;

  // Render color styles for alert
  const getProgressColor = (pct: number) => {
    if (pct < 40) return 'bg-rose-500';
    if (pct < 85) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const getUrgencyBadge = (days: number) => {
    if (days <= 0) return { text: '¡Hoy mismo!', bg: 'bg-rose-600 font-bold border-rose-700 animate-pulse text-white' };
    if (days <= 5) return { text: `Faltan ${days} días (CRÍTICO)`, bg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-bounce' };
    if (days <= 12) return { text: `Faltan ${days} días`, bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { text: `Faltan ${days} días`, bg: 'bg-slate-100 text-slate-750 border-slate-200' };
  };

  const handleOpenDonation = () => {
    // Reset inputs
    setMypeName('');
    setDonationMethod('Especie');
    setCashAmount('');
    const initialItemQuantities: { [key: string]: number } = {};
    activeEvent.itemsBolsa.forEach(item => {
      initialItemQuantities[item.id] = 0;
    });
    setItemQuantities(initialItemQuantities);
    setShowDonationModal(true);
  };

  const handleOpenBalance = () => {
    setMaxBudget(Math.min(availableAcquisitionFund, activeStats.deficitCost).toFixed(0));
    setShowBalanceModal(true);
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mypeName.trim()) return;

    const parsedCash = parseFloat(cashAmount);
    const inKindItemsList: { itemName: string; qty: number }[] = [];

    if (donationMethod === 'Especie') {
      activeEvent.itemsBolsa.forEach(item => {
        const qtyToDonate = itemQuantities[item.id] || 0;
        if (qtyToDonate > 0) {
          inKindItemsList.push({ itemName: item.name, qty: qtyToDonate });
        }
      });
      
      if (inKindItemsList.length === 0) {
        alert("Por favor indique la cantidad para al menos un artículo donado.");
        return;
      }
    }

    onRegisterDonation(
      activeEvent.id,
      mypeName,
      mypeCategory,
      mypeDistrict,
      donationMethod,
      isNaN(parsedCash) ? undefined : parsedCash,
      donationMethod === 'Especie' ? inKindItemsList : undefined
    );

    setShowDonationModal(false);
  };

  const handleBalancingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(maxBudget);
    if (isNaN(parsedBudget) || parsedBudget <= 0) return;

    const result = await onBalanceInventory(activeEvent.id, parsedBudget);
    setShowBalanceModal(false);
    
    // Quick confirm alert (custom elegant styling is inside app, but general native dialog is fine for final confirmations on operations)
    if (!result.success) {
      alert(result.msg);
    }
  };

  return (
    <div id="bolsa-monitor-module" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT PORTION: Selected Event Details & Progress (8 columns) */}
      <div className="lg:col-span-8 flex flex-col justify-between">
        <div>
          {/* Main heading */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-sans font-bold text-slate-800 tracking-tight">
                MONITOR DE "BOLSAS DE EVENTO" Y COBERTURA
              </h3>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono border px-2.5 py-1 rounded-full ${getUrgencyBadge(diffDays).bg}`}>
                {getUrgencyBadge(diffDays).text}
              </span>
              <span className="text-[10px] font-mono font-bold bg-indigo-50/50 border border-indigo-105/60 border-indigo-100/60 text-indigo-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                📍 {activeEvent.district}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-5">
            <h4 id="active-event-title" className="text-xs font-sans font-bold text-slate-900">
              {activeEvent.title}
            </h4>
            <p className="text-[11px] text-slate-500 font-sans mt-1 leading-relaxed">
              {activeEvent.description}
            </p>
            <p className="text-[10px] font-sans font-medium text-slate-500 mt-2 flex items-center gap-1 bg-white py-1 px-2.5 rounded-lg border border-slate-100 w-fit">
              🎯 <strong>Población Objetivo:</strong> {activeEvent.targetAudience}
            </p>
          </div>

          {/* DYNAMIC PROGRESS BARS */}
          <div className="space-y-4">
            {/* 1. Global Coverage (Financial assessment) */}
            <div className="flex items-center gap-5 bg-slate-50/50 border border-slate-100/80 p-4 rounded-2xl shadow-2xs hover:shadow-xs transition-all">
              <div className="shrink-0 bg-white p-2 rounded-xl border border-slate-100 shadow-3xs">
                <CanvasProgress 
                  percentage={activeStats.costPct} 
                  color={activeStats.costPct >= 100 ? '#0d9488' : activeStats.costPct >= 50 ? '#0f766e' : '#b45309'} 
                  size={65} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-1">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">
                      Progreso de Cobertura Financiera
                    </span>
                    <p className="text-[9px] text-slate-400 font-sans mt-0.5 leading-none">
                      Monto valorizado vs. Presupuesto meta de Bolsa
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-slate-900 leading-none">
                      {activeStats.costPct.toFixed(1)}%
                    </span>
                    <p className="text-[9px] text-emerald-700 font-mono font-bold mt-0.5 leading-none">
                      S/. {activeStats.totalCurrentCost.toFixed(0)} / S/. {activeStats.totalTargetCost.toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-205 bg-slate-200/60 rounded-full overflow-hidden mt-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(activeStats.costPct, 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${getProgressColor(activeStats.costPct)}`}
                  />
                </div>
              </div>
            </div>

            {/* Individual Supplies Ledger Listing */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 mt-2">
              <span className="text-2xs font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-3 animate-pulse">
                Inventario de Especies en Bolsa
              </span>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {activeEvent.itemsBolsa.map((item) => {
                  const itemPct = item.targetQty > 0 ? (item.currentQty / item.targetQty) * 105 : 0;
                  const deficitQty = Math.max(0, item.targetQty - item.currentQty);
                  const isCompleted = item.currentQty >= item.targetQty;

                  return (
                    <div key={item.id} className="text-xs bg-white border border-slate-100 rounded-xl p-3 hover:shadow-2xs transition-all">
                      <div className="flex items-center justify-between mb-2 font-sans">
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-slate-800 line-clamp-1">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Valor P.U. est: S/. {item.unitPriceEstimate.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-sans font-bold px-2 py-0.5 rounded text-[10px] ${
                            isCompleted ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'
                          }`}>
                            {item.currentQty} / {item.targetQty} {item.unit}
                          </span>
                          {!isCompleted && (
                            <span className="text-[9px] font-sans font-semibold text-rose-500 block mt-0.5">
                              Faltan: {deficitQty} {item.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mini bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(itemPct)}`}
                            style={{ width: `${Math.min(itemPct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-550 w-8 text-right font-medium">
                          {Math.round(itemPct)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTION TRIGGERS */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
          <button
            id="btn-register-mype-donation"
            onClick={handleOpenDonation}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-sans font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Store className="w-4 h-4 text-white" /> Registrar Donación MYPE
          </button>
          
          <button
            id="btn-automatic-balancing"
            onClick={handleOpenBalance}
            disabled={activeStats.deficitCost <= 0 || availableAcquisitionFund <= 0}
            className={`flex-1 text-xs font-sans font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeStats.deficitCost <= 0 || availableAcquisitionFund <= 0
                ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
            }`}
          >
            <Zap className="w-4 h-4" /> Balancear con Fondo
          </button>
        </div>
      </div>

      {/* RIGHT PORTION: Dynamic Event Quick selector & Urgent alerts (4 columns) */}
      <div className="lg:col-span-4 border-l-0 lg:border-l border-slate-100 lg:pl-6 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-2xs font-mono font-bold text-slate-450 uppercase tracking-wider block mb-3">
            Hitos de Apoyo Social
          </span>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {sortedEvents.map((evt) => {
              const stats = calculateEventCoverage(evt);
              const isSelected = evt.id === activeEvent.id;
              
              // Warning flag
              const evtDate = new Date(evt.date);
              const daysLeft = Math.ceil((evtDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const hasLowCoverageAndNear = daysLeft <= 7 && stats.costPct < 40;

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-100 bg-indigo-50/40 shadow-xs' 
                      : 'border-slate-100 bg-white hover:border-slate-205'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 block">{evt.date}</span>
                    {hasLowCoverageAndNear && (
                      <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-100/50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" /> ALERTA
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-sans font-bold text-slate-800 line-clamp-1 leading-tight">
                    {evt.title}
                  </h5>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400" style={{ width: `${Math.min(stats.costPct, 100)}%` }} />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-500">
                      {Math.round(stats.costPct)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIURA CONTEXT & URGENCY WARNING CARD */}
        <div>
          {isUrgent ? (
            <div id="alert-card-urgent" className="bg-rose-50/60 border border-rose-100/75 p-4 rounded-xl">
              <div className="flex items-start gap-1.5 text-rose-800 mb-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <span className="text-xs font-sans font-bold uppercase block leading-none">
                    DÉFICIT CRÍTICO DETECTADO
                  </span>
                  <span className="text-[9px] text-slate-450 font-mono leading-none">Piura logistics safety check</span>
                </div>
              </div>
              <p className="text-xs text-rose-950 font-sans leading-relaxed">
                El evento en <strong>{activeEvent.district}</strong> tiene programada su labor social en sólo <strong>{diffDays} días</strong> y el inventario cubierto es crítico (sólo alcanzan el <strong>{activeStats.itemsPct.toFixed(0)}%</strong> de ítems).
              </p>
              
              <div className="mt-3 bg-white p-2 border border-rose-100 rounded-xl text-[10px] font-mono text-rose-900 animate-pulse">
                ⚠️ Se requieren <strong>S/. {activeStats.deficitCost.toFixed(2)}</strong> de inyección directa para adquirir los lotes faltantes.
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/40 border border-emerald-100/75 p-4 rounded-xl font-sans">
              <div className="flex items-center gap-1.5 text-emerald-850 text-emerald-800 mb-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-mono font-bold uppercase leading-none">CONTEXTO OPERATIVO PIURA</span>
              </div>
              <p className="text-xs text-emerald-950/90 leading-relaxed">
                Las coordinaciones se realizan localmente coordinando con mototaxis para transporte debido a la fragmentada geografía rural (asentamientos y bajo piura). Se sugiere Yape/Plin para inyección inmediata de MYPEs por eficiencia.
              </p>
            </div>
          )}
        </div>
      </div>


      {/* Modal 1: Registrar Donación MYPE (Direct Especie or Yape) */}
      <AnimatePresence>
        {showDonationModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
            >
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-indigo-400" />
                  <span className="font-sans font-bold text-sm tracking-tight">REGISTRAR DONACIÓN LOCAL MYPE (PIURA)</span>
                </div>
                <button onClick={() => setShowDonationModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDonationSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans text-slate-500 mb-1 font-semibold uppercase tracking-wider">Empresa MYPE local</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Bodega Rosita"
                      value={mypeName}
                      onChange={(e) => setMypeName(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 focus:border-indigo-500 focus:outline-hidden font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-slate-500 mb-1 font-semibold uppercase tracking-wider">Giro del Negocio</label>
                    <select
                      value={mypeCategory}
                      onChange={(e) => setMypeCategory(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 bg-white font-sans focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Bodega">Bodega de Barrio</option>
                      <option value="Panadería">Panadería / Pastelería</option>
                      <option value="Farmacia">Botica / Farmacia local</option>
                      <option value="Comercial">Mini-Market / Distribuidora</option>
                      <option value="Servicios">Talleres o Servicios</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans text-slate-500 mb-1 font-semibold uppercase tracking-wider">Distrito de la MYPE</label>
                    <select
                      value={mypeDistrict}
                      onChange={(e) => setMypeDistrict(e.target.value as PiuraDistrict)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 bg-white font-sans focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Piura Centro">Piura Centro</option>
                      <option value="Catacaos">Catacaos</option>
                      <option value="Castilla">Castilla</option>
                      <option value="Veintiséis de Octubre">Veintiséis de Octubre</option>
                      <option value="Sullana">Sullana</option>
                      <option value="Chulucanas">Chulucanas</option>
                      <option value="Tambogrande">Tambogrande</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-slate-500 mb-1 font-semibold uppercase tracking-wider">Modalidad del Aporte</label>
                    <select
                      value={donationMethod}
                      onChange={(e) => setDonationMethod(e.target.value as DonationMethod)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 bg-white font-sans focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Especie">Especie Directa (Insumos Bolsa)</option>
                      <option value="Yape">Yape</option>
                      <option value="Plin">Plin</option>
                      <option value="Efectivo_CajaChica">Efectivo para Caja Chica</option>
                    </select>
                  </div>
                </div>

                {donationMethod === 'Especie' ? (
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <span className="text-2xs font-mono font-semibold text-slate-450 uppercase block mb-3">
                      Marcar insumos aportados por la MYPE:
                    </span>
                    
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
                      {activeEvent.itemsBolsa.map((item) => {
                        const maxFalta = Math.max(0, item.targetQty - item.currentQty);
                        return (
                          <div key={item.id} className="flex items-center justify-between text-xs font-sans p-1.5 border-b border-dashed border-slate-100 last:border-0">
                            <div>
                              <p className="font-semibold text-slate-700">{item.name}</p>
                              <p className="text-[10px] text-slate-400">Meta pendiente: {maxFalta} {item.unit}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max={maxFalta * 2} // Allow extra donations
                                value={itemQuantities[item.id] || 0}
                                onChange={(e) => {
                                  setItemQuantities({
                                    ...itemQuantities,
                                    [item.id]: parseInt(e.target.value) || 0
                                  });
                                }}
                                className="w-16 text-center border border-slate-200 font-mono rounded py-1 px-1.5 text-xs focus:border-indigo-500 focus:outline-hidden"
                              />
                              <span className="text-[10px] text-slate-400 font-mono">{item.unit}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-sans text-slate-500 mb-1 font-semibold uppercase tracking-wider">Monto Financiero (S/. PEN)</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      min="1"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 focus:border-indigo-500 focus:outline-hidden font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 font-sans italic">
                      * Al ingresar monto líquido vía Yape, Plin o Efectivo, este capital se acredita de forma inmediata en el respectivo fondo del Módulo de Fondos para adquisiciones compensatorias del STARE.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowDonationModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold font-sans text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Regresar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold font-sans transition-all cursor-pointer shadow-xs"
                  >
                    Registrar Aporte
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      
      {/* Modal 2: Adquisición / Balanceo de Bolsa */}
      <AnimatePresence>
        {showBalanceModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="font-sans font-bold text-sm tracking-tight">BALANCEAR BOLSA DE EVENTO</span>
                </div>
                <button onClick={() => setShowBalanceModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBalancingSubmit} className="p-6 space-y-4">
                <p className="text-xs text-slate-650 leading-relaxed font-sans">
                  Esta acción comprará automáticamente existencias insuficientes de insumos para <strong>{activeEvent.title}</strong>, descontándolo directamente del <strong>Fondo de Adquisición Directa</strong>.
                </p>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Saldo actual disponible:</span>
                    <strong className="text-slate-700 font-mono">S/. {availableAcquisitionFund.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Costo total para completar 100%:</span>
                    <strong className="text-rose-650 font-mono text-rose-600">S/. {activeStats.deficitCost.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between pt-1 font-bold">
                    <span className="text-slate-700">Decisión de Adquisición:</span>
                    <span className="text-emerald-650 text-emerald-600">Se financiará del Fondo</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans text-slate-500 font-semibold uppercase tracking-wider mb-1">Monto Asignado A Compras (S/.)</label>
                  <input
                    type="number"
                    required
                    max={availableAcquisitionFund}
                    placeholder="0.00"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full text-sm font-mono py-2 px-3 rounded-xl border border-slate-205 focus:border-indigo-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 font-sans mt-1.5 italic">
                    * El motor consumirá hasta este presupuesto buscando primero rellenar los artículos con cobertura más baja, y registrará los egresos en el Kardex.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBalanceModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold font-sans text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Regresar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-amber-300 hover:bg-slate-800 text-xs font-bold font-sans transition-all cursor-pointer shadow-xs"
                  >
                    Ejecutar Compra
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
