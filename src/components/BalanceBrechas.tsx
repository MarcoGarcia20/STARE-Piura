import React, { useState, useEffect } from 'react';
import { SocialEvent, BolsaItem, FundBalances } from '../types';
import { 
  Building2, 
  Coins, 
  Scale, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Info,
  Calendar,
  MapPin,
  Users,
  ShoppingCart,
  Zap,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEvents } from '../features/events';
import { useFinance } from '../features/finance';

interface BalanceBrechasProps {
  events?: SocialEvent[];
  balances?: FundBalances;
  onDirectBuyItem?: (
    eventId: string, 
    itemId: string, 
    qtyToBuy: number, 
    cost: number, 
    itemName: string
  ) => void;
  selectedEventId?: string | null;
  onSelectEvent?: (id: string) => void;
}

export const BalanceBrechas: React.FC<BalanceBrechasProps> = ({
  events: propEvents,
  balances: propBalances,
  onDirectBuyItem: propOnDirectBuyItem,
  selectedEventId: propSelectedEventId,
  onSelectEvent: propOnSelectEvent
}) => {
  const { events: hookEvents, selectedEventId: hookSelectedId, setSelectedEventId: hookSelectEvent, directBuyItem: hookDirectBuy } = useEvents();
  const { balances: hookBalances } = useFinance();

  const events = propEvents || hookEvents || [];
  const balances = { cajaChica: 0, fondoAdquisicion: 0, ...(propBalances || hookBalances) };
  const selectedEventId = propSelectedEventId !== undefined ? propSelectedEventId : hookSelectedId;
  const onSelectEvent = propOnSelectEvent || hookSelectEvent;

  const onDirectBuyItem = propOnDirectBuyItem || (async (eventId, itemId, qtyToBuy) => {
    await hookDirectBuy(eventId, itemId, qtyToBuy);
  });
  // If no selectedEventId or it is 'stock_general', let's default to the first event
  const initialEventId = selectedEventId && selectedEventId !== 'stock_general' 
    ? selectedEventId 
    : (events[0]?.id || '');
  
  const [activeEventId, setActiveEventId] = useState<string>(initialEventId);
  const selectedEvent = events.find(e => e.id === activeEventId);

  // Sync state with parent change
  useEffect(() => {
    if (selectedEventId && selectedEventId !== 'stock_general') {
      setActiveEventId(selectedEventId);
    }
  }, [selectedEventId]);

  // local selected item to close gap
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = selectedEvent?.itemsBolsa.find(item => item.id === selectedItemId);

  // Track local action messages
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Handler to switch active event
  const handleEventChange = (id: string) => {
    setActiveEventId(id);
    onSelectEvent(id);
    setSelectedItemId(null); // Clear selected item
    setActionSuccess(null);
  };

  const handleAuthorizedPurchase = () => {
    if (!selectedEvent || !selectedItem) return;

    const deficit = Math.max(0, selectedItem.targetQty - selectedItem.currentQty);
    if (deficit <= 0) return;

    const totalCost = deficit * selectedItem.unitPriceEstimate;

    if (totalCost > (balances?.fondoAdquisicion ?? 0)) {
      alert('¡Fondo de Adquisición Insuficiente! Por favor, registre un aporte económico con Yape/Plin o Caja Chica antes de continuar.');
      return;
    }

    // Call the parent state updater
    onDirectBuyItem(
      selectedEvent.id,
      selectedItem.id,
      deficit,
      totalCost,
      selectedItem.name
    );

    setActionSuccess(`¡Gasto autorizado con éxito! Se han restado S/. ${(totalCost ?? 0).toFixed(2)} del Fondo de Adquisición Directa para adquirir ${deficit} ${selectedItem.unit} de ${selectedItem.name}.`);
    setSelectedItemId(null);

    setTimeout(() => {
      setActionSuccess(null);
    }, 6000);
  };

  // Calculations for current event bolsa progress
  let eventTargetSum = 0;
  let eventCurrentSum = 0;
  selectedEvent?.itemsBolsa.forEach(item => {
    eventTargetSum += item.targetQty * item.unitPriceEstimate;
    eventCurrentSum += item.currentQty * item.unitPriceEstimate;
  });
  const eventCoveragePct = eventTargetSum > 0 ? (eventCurrentSum / eventTargetSum) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* 1. SECCIÓN: CABECERA Y SELECTOR DE EVENTO + FONDOS DISPONIBLES */}
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-6 shadow-md border-b-4 border-slate-950">
        
        {/* Background ambient accents */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute left-1/3 bottom-0 -mb-10 w-40 h-40 bg-orange-400/5 rounded-full blur-2xl" />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          
          {/* Activity Info Panel & Dropdown */}
          <div className="space-y-4 xl:max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-mono font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full border border-slate-950">
                BALANCE Y CIERRE DE BRECHAS
              </span>
              <span className="bg-emerald-500/20 text-emerald-450 text-[10px] uppercase font-mono px-2.5 py-1 rounded-full border border-emerald-500/20">
                Auditoría Pre-Viaje (Piura)
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Seleccione la labor social a auditar:
              </label>
              <select
                value={activeEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="w-full text-sm font-sans font-black bg-slate-800 text-amber-300 border border-slate-700 rounded-xl px-4 py-2.5 outline-hidden focus:border-amber-400"
              >
                {events?.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    🗓️ {evt.district} — {evt.title} ({evt.date})
                  </option>
                ))}
              </select>
            </div>

            {selectedEvent && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs text-slate-350">
                <div className="flex items-center gap-2 bg-slate-800/40 p-2 rounded-xl border border-slate-750 min-w-0">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase font-mono text-slate-500">Ubicación</p>
                    <p className="font-semibold text-white truncate">{selectedEvent.district}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/40 p-2 rounded-xl border border-slate-750 min-w-0">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase font-mono text-slate-500">Fecha del Viaje</p>
                    <p className="font-semibold text-white truncate">{selectedEvent.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/40 p-2 rounded-xl border border-slate-750 min-w-0">
                  <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] uppercase font-mono text-slate-500">Público Objetivo</p>
                    <p className="font-semibold text-white break-words whitespace-normal text-xs leading-normal" title={selectedEvent.targetAudience}>
                      {selectedEvent.targetAudience}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Funds Panel */}
          <div className="grid grid-cols-2 gap-4 xl:w-96 shrink-0">
            
            {/* Saldo Caja Chica Card */}
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-2 top-2 p-1.5 bg-slate-800 rounded-xl">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Caja Chica Logística
                </span>
                <span className="text-xl font-sans font-black text-white block mt-1 tracking-tight">
                  S/. {(balances?.cajaChica ?? 0).toFixed(2)}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal mt-3 bg-slate-800/40 p-1.5 rounded border border-slate-800">
                Fletes, combustibles e imprevistos.
              </p>
            </div>

            {/* Saldo Fondo Adquisición Directa Card */}
            <div className="bg-slate-850 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-2 top-2 p-1.5 bg-amber-500/10 rounded-xl">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Adquisición Directa
                </span>
                <span className="text-xl font-sans font-black text-amber-400 block mt-1 tracking-tight">
                  S/. {(balances?.fondoAdquisicion ?? 0).toFixed(2)}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 leading-normal mt-3 bg-slate-800/40 p-1.5 rounded border border-slate-800">
                Financiamiento de brechas de bolsas.
              </p>
            </div>

          </div>

        </div>

        {/* Global Event Coverage Bar inside details */}
        {selectedEvent && (
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-850/50 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-350">
              <Scale className="w-4 h-4 text-amber-400" />
              <p className="font-sans">
                Cobertura de Canasta: {selectedEvent.title} está cubierto al <strong className="text-white text-sm">{(eventCoveragePct ?? 0).toFixed(1)}%</strong>
              </p>
            </div>
            <div className="w-full sm:w-72 h-2.5 bg-slate-700 rounded-full overflow-hidden border border-slate-900 pb-0.5">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-300" 
                style={{ width: `${eventCoveragePct}%` }}
              />
            </div>
          </div>
        )}

      </div>

      {actionSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Gasto Liquidado Correctamente</p>
            <p className="mt-1 leading-relaxed">{actionSuccess}</p>
          </div>
        </motion.div>
      )}

      {/* 2 & 3 SECCIÓN: BENTO GRID CON TABLA DE BALANCE Y PANEL DE INYECCIÓN DE FONDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Tabla de Balance de Insumos (Left/9 Columns) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-sans font-bold text-slate-800 text-sm">
                  Matriz de Coberturas y Déficits de la Bolsa
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">META LOGÍSTICA COMPLETA VS REGISTRO MYPE EN ESPECIE</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 py-1 px-2 rounded-full font-bold">
              {selectedEvent?.itemsBolsa.length || 0} Artículos Requeridos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans min-w-[550px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <th className="py-3 px-4">Insumo Requerido</th>
                  <th className="py-3 px-3 text-center">Meta Logística</th>
                  <th className="py-3 px-3 text-center">Recaudado MYPE</th>
                  <th className="py-3 px-3 text-center">Tasa de Entrega</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Brecha / Déficit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/75">
                {selectedEvent?.itemsBolsa.map((item) => {
                  const deficit = Math.max(0, item.targetQty - item.currentQty);
                  const isSatisfied = deficit <= 0;
                  const percentCollected = Math.min(100, (item.currentQty / item.targetQty) * 100);
                  const isSelected = selectedItemId === item.id;

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => !isSatisfied && setSelectedItemId(item.id)}
                      className={`transition-all hover:bg-slate-50/80 group ${
                        !isSatisfied ? 'cursor-pointer' : 'opacity-85 hover:bg-slate-50/30'
                      } ${isSelected ? 'bg-indigo-50/60 border-l-4 border-indigo-600' : ''}`}
                    >
                      {/* Name of item */}
                      <td className="py-3 px-4">
                        <div>
                          <p className={`font-bold transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-850 text-slate-800'}`}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Costo Ref: S/. {(item.unitPriceEstimate ?? 0).toFixed(2)} por {item.unit}
                          </p>
                        </div>
                      </td>

                      {/* Targeted Quantity */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {item.targetQty} <span className="text-slate-400 text-[10px] font-normal">{item.unit}</span>
                      </td>

                      {/* Currently Collected Quantity */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-805">
                        <span className={item.currentQty > 0 ? 'text-emerald-700 p-1 bg-emerald-50 rounded-md border border-emerald-100' : 'text-slate-500'}>
                          {item.currentQty} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                        </span>
                      </td>

                      {/* Small inline rate viz */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-500 shrink-0">
                            {(percentCollected ?? 0).toFixed(0)}%
                          </span>
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${isSatisfied ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                              style={{ width: `${percentCollected}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status indicator */}
                      <td className="py-3 px-3 text-center">
                        {isSatisfied ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 py-0.5 px-2 rounded-full font-bold text-[9px] uppercase tracking-wider font-mono">
                            <CheckCircle2 className="w-3 h-3 shrink-0" /> Recaudado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 py-0.5 px-2 rounded-full font-bold text-[9px] uppercase tracking-wider font-mono animate-pulse">
                            <AlertTriangle className="w-3 h-3 shrink-0" /> En Déficit
                          </span>
                        )}
                      </td>

                      {/* Final Gap with styling */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {isSatisfied ? (
                          <span className="text-emerald-600 block text-[11px]">Satisfecho 📦</span>
                        ) : (
                          <span className="text-rose-600 block text-xs bg-rose-50 border border-rose-100/50 py-1 px-2 rounded-md w-fit ml-auto">
                            -{deficit} u.
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] text-slate-400 flex items-start gap-1.5 font-sans leading-relaxed">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p>
              <strong>Guía de Trazabilidad Logística:</strong> Los rubros marcados con "En Déficit" indican que las microdonaciones en especie recolectadas por las MYPEs de Piura no han alcanzado la meta requerida para la labor social. Haga clic en una fila con déficit para habilitar la inyección compensatoria desde el Fondo de Adquisición Directa.
            </p>
          </div>

        </div>

        {/* Panel de Inyección de Balance Financiero (Right/4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          <AnimatePresence mode="wait">
            {selectedItemId && selectedItem && selectedEvent ? (
              <motion.div
                key={selectedItemId}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-indigo-950 border border-indigo-900 rounded-3xl p-5 md:p-6 text-white shadow-md relative overflow-hidden"
              >
                
                {/* Background ambient badge */}
                <div className="absolute right-0 top-0 -mt-8 -mr-8 w-28 h-28 bg-amber-400/10 rounded-full blur-xl" />

                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold uppercase tracking-wider mb-4">
                  <Zap className="w-4 h-4 animate-bounce" />
                  <span>CIERRE DE BRECHA CON FONDOS</span>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  
                  {/* Selected Resource Title */}
                  <div className="border-b border-indigo-805 pb-3">
                    <p className="text-[10px] uppercase font-mono text-indigo-300">Insumo a Cerrar Balance</p>
                    <p className="text-base font-black text-white mt-0.5">{selectedItem.name}</p>
                    <p className="text-[10px] text-indigo-200 font-mono mt-0.5 italic">Hito: {selectedEvent.title}</p>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="space-y-2.5 bg-indigo-900/40 p-3.5 rounded-2xl border border-indigo-800">
                    
                    {/* Deficit Amount */}
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-200">Brecha Faltante:</span>
                      <span className="font-mono font-black text-amber-400">
                        {selectedItem.targetQty - selectedItem.currentQty} {selectedItem.unit}
                      </span>
                    </div>

                    {/* Unit cost estimate */}
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-200">Costo Local Unitario (Piura):</span>
                      <span className="font-mono text-white">
                        S/. {(selectedItem?.unitPriceEstimate ?? 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-dashed border-indigo-750 pt-2 flex items-center justify-between text-sm font-bold">
                      <span className="text-white">Costo Total Compra:</span>
                      <span className="font-mono font-black text-amber-350 text-white leading-none text-base">
                        S/. {(((selectedItem?.targetQty ?? 0) - (selectedItem?.currentQty ?? 0)) * (selectedItem?.unitPriceEstimate ?? 0)).toFixed(2)}
                      </span>
                    </div>

                  </div>

                  {/* Funds audit checklist */}
                  <div className="space-y-2 text-[11px] font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-200">Fondo Adquisición Disponible:</span>
                      <span className={`font-mono font-bold ${(balances?.fondoAdquisicion ?? 0) >= (((selectedItem?.targetQty ?? 0) - (selectedItem?.currentQty ?? 0)) * (selectedItem?.unitPriceEstimate ?? 0)) ? 'text-emerald-400' : 'text-rose-400'}`}>
                        S/. {(balances?.fondoAdquisicion ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Error check or CTA */}
                  {(balances?.fondoAdquisicion ?? 0) < (((selectedItem?.targetQty ?? 0) - (selectedItem?.currentQty ?? 0)) * (selectedItem?.unitPriceEstimate ?? 0)) ? (
                    <div className="p-3 bg-rose-950/50 border border-rose-900/50 text-rose-200 rounded-xl flex items-start gap-1.5 leading-relaxed text-[10px]">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <p>
                        <strong>Fondo Insuficiente:</strong> El saldo en el Fondo de Adquisición Directa no es suficiente para compensar la brecha logística de este insumo. Por favor capture fondos en el módulo de captación o asiente una acreditación bancaria administrativa.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/40 text-emerald-250 rounded-xl flex items-center gap-1.5 text-[10px] text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Saldo suficiente. El costo se debitará en S/. {(((selectedItem?.targetQty ?? 0) - (selectedItem?.currentQty ?? 0)) * (selectedItem?.unitPriceEstimate ?? 0)).toFixed(2)}</span>
                    </div>
                  )}

                  {/* AUTHORIZE CTA BUTTON */}
                  <button
                    type="button"
                    onClick={handleAuthorizedPurchase}
                    disabled={(balances?.fondoAdquisicion ?? 0) < (((selectedItem?.targetQty ?? 0) - (selectedItem?.currentQty ?? 0)) * (selectedItem?.unitPriceEstimate ?? 0))}
                    className={`w-full font-sans font-black py-3 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md ${
                      (balances?.fondoAdquisicion ?? 0) >= (((selectedItem?.targetQty ?? 0) - (selectedItem?.currentQty ?? 0)) * (selectedItem?.unitPriceEstimate ?? 0))
                        ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-inner'
                        : 'bg-indigo-900 text-indigo-400 cursor-not-allowed border border-indigo-850/40'
                    }`}
                  >
                    Autorizar Gasto e Inyectar <ArrowRight className="w-4.5 h-4.5" />
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedItemId(null)}
                      className="text-[10px] text-indigo-300 hover:text-white underline"
                    >
                      Cancelar selección
                    </button>
                  </div>

                </div>

              </motion.div>
            ) : (
              <motion.div
                key="empty-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-xs flex flex-col items-center justify-center min-h-[290px]"
              >
                <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4 border border-slate-100">
                  <ShoppingCart className="w-8 h-8 mx-auto" />
                </div>
                <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Caja de Inyección de Brechas</h5>
                <p className="text-[11px] text-slate-400 mt-2 max-w-[220px] mx-auto leading-relaxed">
                  Haga clic en un insumo marcado como <strong>"En Déficit"</strong> en la matriz de la izquierda para desplegar el simulador de adquisiciones automáticas de Piura.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
};
