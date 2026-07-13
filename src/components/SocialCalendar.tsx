import React, { useState } from 'react';
import { SocialEvent, PiuraDistrict, EventStatus, BolsaItem } from '../types';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Sparkles, 
  Layers, 
  X,
  PlusSquare,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useEvents } from '../features/events';

interface SocialCalendarProps {
  events?: SocialEvent[];
  selectedEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
  onAddEvent?: (newEvent: SocialEvent) => void;
}

export const SocialCalendar: React.FC<SocialCalendarProps> = ({
  events: propEvents,
  selectedEventId: propSelectedEventId,
  onSelectEvent: propOnSelectEvent,
  onAddEvent: propOnAddEvent,
}) => {
  const { events: hookEvents, selectedEventId: hookSelectedId, setSelectedEventId: hookSelectEvent, addEvent: hookAddEvent } = useEvents();

  const events = propEvents || hookEvents;
  const selectedEventId = propSelectedEventId !== undefined ? propSelectedEventId : hookSelectedId;
  const onSelectEvent = propOnSelectEvent || hookSelectEvent;
  const onAddEvent = propOnAddEvent || hookAddEvent;
  // District filter
  const [districtFilter, setDistrictFilter] = useState<PiuraDistrict | 'Todos'>('Todos');
  
  // Create Event Modal State
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDistrict, setNewDistrict] = useState<PiuraDistrict>('Piura Centro');
  const [newDay, setNewDay] = useState('10'); // Defaults to June 10, 2026
  const [newAudience, setNewAudience] = useState('');
  const [supplyInput, setSupplyInput] = useState('');
  const [newSupplies, setNewSupplies] = useState<{ name: string; qty: number; unit: string; price: number }[]>([
    { name: 'Leche evaporada entera', qty: 50, unit: 'tarros de 170g', price: 4.2 },
    { name: 'Arroz extra de grano largo', qty: 1, unit: 'sacos de 50kg', price: 165.0 },
  ]);

  const PIURA_DISTRICTS: PiuraDistrict[] = [
    'Piura Centro', 'Catacaos', 'Castilla', 'Veintiséis de Octubre', 
    'Sullana', 'Chulucanas', 'Sechura', 'Paita', 'Talara', 'Tambogrande'
  ];

  // For June 2026: 30 days, June 1st is a Monday.
  const June2026Days = Array.from({ length: 30 }, (_, i) => i + 1);

  // Filtered events
  const filteredEvents = events.filter(e => {
    if (districtFilter === 'Todos') return true;
    return e.district === districtFilter;
  });

  const getEventForDay = (dayNum: number) => {
    const formattedDate = `2026-06-${dayNum.toString().padStart(2, '0')}`;
    return filteredEvents.find(e => e.date === formattedDate);
  };

  const handleAddSupplyItem = () => {
    if (!supplyInput.trim()) return;
    setNewSupplies([
      ...newSupplies,
      { name: supplyInput, qty: 10, unit: 'unidades', price: 5.0 }
    ]);
    setSupplyInput('');
  };

  const handleRemoveSupplyItem = (index: number) => {
    setNewSupplies(newSupplies.filter((_, idx) => idx !== index));
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAudience.trim()) return;

    const formattedDate = `2026-06-${newDay.padStart(2, '0')}`;
    
    // Map inputs to strict BolsaItem structure
    const itemsBolsa: BolsaItem[] = newSupplies.map((s, idx) => ({
      id: `bi-added-${Date.now()}-${idx}`,
      name: s.name,
      unit: s.unit,
      targetQty: s.qty,
      currentQty: 0, // Starts at 0% coverage
      unitPriceEstimate: s.price
    }));

    const newEvent: SocialEvent = {
      id: `ev-${Date.now()}`,
      title: newTitle,
      description: newDescription || 'Sin descripción',
      date: formattedDate,
      district: newDistrict,
      targetAudience: newAudience,
      status: 'programado',
      itemsBolsa
    };

    onAddEvent(newEvent);

    // Reset fields & close
    setNewTitle('');
    setNewDescription('');
    setNewDistrict('Piura Centro');
    setNewDay('10');
    setNewAudience('');
    setNewSupplies([
      { name: 'Leche evaporada entera', qty: 50, unit: 'tarros de 170g', price: 4.2 },
      { name: 'Arroz extra de grano largo', qty: 1, unit: 'sacos de 50kg', price: 165.0 },
    ]);
    setShowAddEventModal(false);
  };

  return (
    <div id="calendar-module" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="text-base font-sans font-bold text-slate-900 tracking-tight">
              ROLES Y CALENDARIO DE LABOR SOCIAL
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Planificación estratégica de entrega de ayuda humanitaria coordinada • <strong className="text-slate-600">Junio 2026</strong>
          </p>
        </div>

        {/* Action button removed per user request */}
      </div>

      {/* FILTER PANEL */}
      <div className="bg-slate-50/50 border border-slate-100/90 rounded-2xl p-3.5 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-2xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filtro Distrito:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setDistrictFilter('Todos')}
            className={`text-2xs font-sans px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              districtFilter === 'Todos'
                ? 'bg-slate-905 bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                : 'bg-white text-slate-600 border-slate-200/60 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          {PIURA_DISTRICTS.map((dst) => {
            const hasEventsInDst = events.some(e => e.district === dst);
            return (
              <button
                key={dst}
                onClick={() => setDistrictFilter(dst)}
                className={`text-2xs font-sans px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                  districtFilter === dst
                    ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200/60 hover:bg-slate-100'
                }`}
              >
                {dst}
                {hasEventsInDst && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CALENDAR GRID (JUNE 2026 - Starts on Monday, 30 Days) */}
      <div className="border border-slate-100 rounded-2xl overflow-x-auto bg-white shadow-sm">
        <div className="min-w-[700px]">
        {/* Week headers */}
        <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-100 py-2.5 text-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mié <span className="text-[9px] text-amber-600 font-extrabold bg-amber-100/60 px-1.5 py-0.5 rounded-md ml-0.5">(Hoy)</span></div>
          <div>Jue</div>
          <div>Vie</div>
          <div>Sáb</div>
          <div>Dom</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-100/70">
          {June2026Days.map((day) => {
            const dateStr = `2026-06-${day.toString().padStart(2, '0')}`;
            const isToday = day === 3; // June 3rd, 2026
            const event = getEventForDay(day);
            const isSelected = selectedEventId && event?.id === selectedEventId;

            return (
              <div
                key={day}
                onClick={() => event && onSelectEvent(event.id)}
                className={`min-h-[102px] bg-white p-2.5 flex flex-col justify-between transition-all select-none ${
                  event ? 'cursor-pointer hover:bg-indigo-50/20' : 'text-slate-300'
                } ${isToday ? 'bg-amber-50/30' : ''} ${
                  isSelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Day number */}
                  <span className={`text-[11px] font-mono font-bold ${
                    isToday 
                      ? 'bg-amber-500 text-white px-1.5 py-0.5 rounded-md shadow-xs font-extrabold' 
                      : 'text-slate-500'
                  }`}>
                    {day}
                  </span>

                  {/* Icon indicator */}
                  {event && (
                    <span className={`w-2 h-2 rounded-full ${
                      event.district === 'Tambogrande' 
                        ? 'bg-rose-500 animate-pulse' 
                        : 'bg-indigo-500 shadow-xs'
                    }`} />
                  )}
                </div>

                {/* Event microcard */}
                {event ? (
                  <>
                    {/* Desktop View Detailed info */}
                    <div className="mt-2 text-left hidden sm:block">
                      <p className="text-[10px] font-sans font-bold text-slate-800 line-clamp-2 leading-tight">
                        {event.title}
                      </p>
                      <p className="text-[9px] font-sans font-medium text-slate-400 mt-1 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-indigo-500" />
                        {event.district}
                      </p>
                    </div>
                    {/* Mobile View Compact high visual indicator */}
                    <div className="mt-1 sm:hidden flex flex-col items-center justify-center bg-amber-50 rounded-md border border-amber-200/50 py-1 px-0.5 shadow-3xs">
                      <span className="text-[7.5px] text-amber-850 font-black tracking-wider leading-none truncate w-full text-center uppercase">
                        {event.district.substring(0, 5)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1" /> // empty space
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      <p className="text-[11px] font-sans text-slate-400 text-right mt-3 italic leading-relaxed">
        * Seleccione un día de color para auditar la cobertura de su Bolsa de Evento o inyectar microdonaciones directas.
      </p>


      {/* Modal: Programar Labor Social */}
      <AnimatePresence>
        {showAddEventModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span className="font-sans font-bold text-sm tracking-tight text-slate-900 uppercase">PROGRAMAR NUEVO EVENTO (PIURA)</span>
                </div>
                <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEventSubmit} className="p-6 space-y-4 max-h-[520px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-mono text-slate-500 mb-1.5 font-bold uppercase">Sector / Distrito</label>
                    <select
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value as PiuraDistrict)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-sans text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                    >
                      {PIURA_DISTRICTS.map((dst) => (
                        <option key={dst} value={dst}>{dst}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-2xs font-mono text-slate-500 mb-1.5 font-bold uppercase">Fecha (Junio 2026)</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-sans text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                    >
                      {June2026Days.map((day) => (
                        <option key={day} value={day.toString().padStart(2, '0')}>
                          Día {day} de Junio
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-mono text-slate-500 mb-1 font-bold uppercase">Nombre del Evento de Labor Social</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Campaña Médica y Entrega de Alimentos - Sechura"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:outline-hidden font-sans"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-mono text-slate-500 mb-1 font-bold uppercase">Población Beneficiaria / Dirección</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 130 mamás de la Olla Común - San Martín en Tambogrande"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:outline-hidden font-sans"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-mono text-slate-500 mb-1 font-bold uppercase">Descripción Zonal / Coordinaciones</label>
                  <textarea
                    rows={2}
                    placeholder="Escriba condiciones climáticas, de acceso o contactos locales en Piura..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:outline-hidden font-sans"
                  />
                </div>

                {/* Item List setup inside form */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-2xs font-mono text-slate-500 font-bold uppercase">
                      Bolsa de Evento: Suministros Requeridos
                    </label>
                    <span className="text-[10px] bg-slate-100 font-extrabold text-slate-600 px-2.5 py-1 rounded-full font-sans">
                      {newSupplies.length} insumos
                    </span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Ej. Aceite vegetal"
                      value={supplyInput}
                      onChange={(e) => setSupplyInput(e.target.value)}
                      className="flex-1 text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddSupplyItem}
                      className="bg-slate-900 text-white font-sans font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>

                  {newSupplies.length === 0 ? (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center text-xs text-rose-850 flex items-center justify-center gap-1.5 font-sans">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      Debe configurar los suministros mínimos para este hito.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {newSupplies.map((s, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50/60 border border-slate-100 rounded-xl text-xs font-sans">
                          <div className="line-clamp-1 pr-2">
                            <span className="font-semibold text-slate-700">{s.name}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({s.unit})</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-sans">Meta:</span>
                              <input
                                type="number"
                                min="1"
                                value={s.qty}
                                onChange={(e) => {
                                  const updated = [...newSupplies];
                                  updated[index].qty = parseInt(e.target.value) || 1;
                                  setNewSupplies(updated);
                                }}
                                className="w-12 text-center text-xs border border-slate-200 bg-white text-slate-900 font-mono py-1 rounded-lg"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-sans">P.U:</span>
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={s.price}
                                onChange={(e) => {
                                  const updated = [...newSupplies];
                                  updated[index].price = parseFloat(e.target.value) || 0.1;
                                  setNewSupplies(updated);
                                }}
                                className="w-14 text-center text-xs border border-slate-200 bg-white text-slate-900 font-mono py-1 rounded-lg"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSupplyItem(index)}
                              className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-sm font-mono cursor-pointer"
                              title="Borrar"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddEventModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    Guardar Labor Social
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
