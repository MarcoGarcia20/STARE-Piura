import React, { useState, useEffect, useRef } from 'react';
import { FundBalances, BalanceMovement, FundSourceType, MovementType } from '../types';
import { 
  PiggyBank, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  History, 
  Truck, 
  FileText, 
  HelpCircle,
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../features/finance';

// ─── Componente Local: Contador Animado de Alta Fidelidad ───────────────────────
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    if (startValue === endValue) return;

    const duration = 600; // ms
    const startTime = performance.now();
    let animationId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // EaseOutQuad

      const current = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationId = requestAnimationFrame(updateNumber);
      } else {
        previousValueRef.current = endValue;
      }
    };

    animationId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animationId);
  }, [value]);

  return <span>S/. {displayValue.toFixed(2)}</span>;
};

// ─── Componente Local: Canvas de Partículas de Fondo Líquido ───────────────────
const CanvasBackground: React.FC<{ color: string }> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }> = Array.from({ length: 15 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height + height,
      radius: Math.random() * 2.5 + 0.8,
      speedY: -(Math.random() * 0.35 + 0.08),
      speedX: Math.random() * 0.16 - 0.08,
      opacity: Math.random() * 0.35 + 0.08,
    }));

    let animationId: number;

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas || !ctx) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none -z-10" />;
};

interface KPICardsProps {
  balances?: FundBalances;
  movements?: BalanceMovement[];
  onAddTransaction?: (fund: FundSourceType, type: 'ingreso' | 'egreso', amount: number, description: string, method: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ 
  balances: propBalances, 
  movements: propMovements, 
  onAddTransaction: propOnAddTransaction 
}) => {
  const { balances: hookBalances, movements: hookMovements, addTransaction: hookAddTransaction } = useFinance();

  const balances = propBalances || hookBalances;
  const movements = propMovements || hookMovements;
  const onAddTransaction = propOnAddTransaction || hookAddTransaction;
  const [showLogisticsModal, setShowLogisticsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Transaction Form States
  const [targetFund, setTargetFund] = useState<FundSourceType>('caja_chica');
  const [txType, setTxType] = useState<'ingreso' | 'egreso'>('egreso');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState('Efectivo');

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction(targetFund, txType, parsedAmount, description, method);
    
    // Reset and close
    setAmount('');
    setDescription('');
    setMethod('Efectivo');
    setShowLogisticsModal(false);
  };

  const openQuickLogistics = () => {
    setTargetFund('caja_chica');
    setTxType('egreso');
    setDescription('Flete de transportista para acarreo de víveres');
    setMethod('Efectivo');
    setShowLogisticsModal(true);
  };

  const openDirectCapital = () => {
    setTargetFund('fondo_adquisicion');
    setTxType('ingreso');
    setDescription('Aporte MYPE local / Acumulado Yape');
    setMethod('Yape');
    setShowLogisticsModal(true);
  };

  return (
    <>
      <div id="kpi-section" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Saldo en Caja Chica Card */}
        <motion.div 
        id="card-caja-chica"
        whileHover={{ y: -2 }}
        className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all relative overflow-hidden flex flex-col justify-between text-[var(--color-text-primary)]"
      >
        <CanvasBackground color="rgba(16, 185, 129, 0.22)" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-6 -mt-6 -z-10 opacity-70" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-extrabold bg-emerald-100/60 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full">
              Caja Chica Logística
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <h4 className="text-xs font-sans font-medium text-[var(--color-text-tertiary)]">Rutas locales y combustibles</h4>
          <h2 className="text-2xl font-mono font-black text-[var(--color-text-primary)] mt-1 tracking-tight">
            <AnimatedCounter value={balances?.cajaChica ?? 0} />
          </h2>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2 flex items-center gap-1.5 font-sans leading-relaxed">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Gastos inmediatos de mototaxi y viáticos en Piura.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <button 
            id="btn-gasto-caja"
            onClick={openQuickLogistics}
            className="w-full bg-[var(--color-bg-secondary)] hover:bg-emerald-500/10 text-[var(--color-text-secondary)] hover:text-emerald-600 text-xs font-sans font-bold py-2.5 px-4 rounded-xl border border-[var(--color-border)] hover:border-emerald-250 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" /> Registrar Gasto/Ingreso
          </button>
        </div>
      </motion.div>

      {/* 2. Fondo de Adquisición Directa Card */}
      <motion.div 
        id="card-fondo-adquisicion"
        whileHover={{ y: -2 }}
        className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all relative overflow-hidden flex flex-col justify-between text-[var(--color-text-primary)]"
      >
        <CanvasBackground color="rgba(99, 102, 241, 0.22)" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-6 -mt-6 -z-10 opacity-70" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-extrabold bg-indigo-100/60 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full">
              Fondo de Adquisición
            </span>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <h4 className="text-xs font-sans font-medium text-[var(--color-text-tertiary)]">Balanceador de Bolsas</h4>
          <h2 className="text-2xl font-mono font-black text-[var(--color-text-primary)] mt-1 tracking-tight">
            <AnimatedCounter value={balances?.fondoAdquisicion ?? 0} />
          </h2>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2 flex items-center gap-1.5 font-sans leading-relaxed">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Acumulado MYPE para comprar insumos faltantes.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <button 
            id="btn-ingreso-fondo"
            onClick={openDirectCapital}
            className="w-full bg-[var(--color-bg-secondary)] hover:bg-indigo-500/10 text-[var(--color-text-secondary)] hover:text-indigo-600 text-xs font-sans font-bold py-2.5 px-4 rounded-xl border border-[var(--color-border)] hover:border-indigo-250 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" /> Inyectar a Adquisición
          </button>
        </div>
      </motion.div>

      {/* 3. Libro de Caja / Ledger Summary & History trigger */}
      <motion.div 
        id="card-balance-resumen"
        whileHover={{ y: -2 }}
        className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-extrabold bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              Libro de Movimientos
            </span>
            <button 
              id="btn-ver-historial"
              onClick={() => setShowHistoryModal(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Ver todo"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-[11px] font-sans text-slate-400">Últimas 3 transacciones:</h4>
          
          <div className="mt-3 space-y-2.5">
            {(movements || []).slice(0, 3).map((mov) => (
              <div key={mov.id} className="flex items-start justify-between border-b border-slate-800/80 pb-2 last:border-0 last:pb-0">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-sans font-semibold text-slate-200 truncate" title={mov.description}>
                    {mov.description}
                  </p>
                  <p className="text-[9px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                    <span className="uppercase font-bold text-slate-450 text-slate-400">{mov.fund.replace('_', ' ')}</span> • {mov.date}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 font-mono text-[11px] font-bold">
                  {mov.type === 'ingreso' ? (
                    <span className="text-emerald-450 text-emerald-400 flex items-center">+S/.{mov.amount.toFixed(0)}</span>
                  ) : (
                    <span className="text-rose-450 text-rose-450 text-rose-400 flex items-center">-S/.{mov.amount.toFixed(0)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-2">
          <button
            id="trigger-history-drawer"
            onClick={() => setShowHistoryModal(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-sans font-bold py-2 px-3 rounded-xl border border-slate-700 text-center transition-colors cursor-pointer"
          >
            Ver Historial Completo ({(movements || []).length})
          </button>
        </div>
      </motion.div>
    </div>


      {/* Modal 1: Registrar Gasto/Ingreso */}
      <AnimatePresence>
        {showLogisticsModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="font-sans font-bold text-sm tracking-tight">REGISTRAR EN LIBRO DE CAJA</span>
                </div>
                <button onClick={() => setShowLogisticsModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitTransaction} className="p-6 space-y-4">
                <div>
                  <label className="block text-2xs font-mono text-slate-500 mb-1.5 font-bold uppercase">Fondo Afectado</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetFund('caja_chica')}
                      className={`text-xs py-2 px-3 rounded-xl border font-bold transition-all text-center cursor-pointer ${
                        targetFund === 'caja_chica' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950' 
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Caja Chica Logística
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetFund('fondo_adquisicion')}
                      className={`text-xs py-2 px-3 rounded-xl border font-bold transition-all text-center cursor-pointer ${
                        targetFund === 'fondo_adquisicion' 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-950' 
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      Fondo Adquisición
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-mono text-slate-500 mb-1.5 font-bold uppercase">Tipo de Flujo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType('ingreso')}
                      className={`text-xs py-2 px-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        txType === 'ingreso' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950' 
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Ingreso / Donativo
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('egreso')}
                      className={`text-xs py-2 px-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        txType === 'egreso' 
                          ? 'border-rose-500 bg-rose-50 text-rose-950' 
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <ArrowDownRight className="w-4 h-4 text-rose-600" /> Gasto / Egreso
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-mono text-slate-500 mb-1 font-bold uppercase">Monto (S/.)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 font-mono focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-mono text-slate-500 mb-1 font-bold uppercase">Método / Canal</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-sans focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Efectivo">Efectivo Físico</option>
                      <option value="Yape">Yape</option>
                      <option value="Plin">Plin</option>
                      <option value="Transferencia">Transferencia Bancaria</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-mono text-slate-500 mb-1 font-bold uppercase">Descripción de la operación</label>
                  <textarea
                    rows={2}
                    required
                    maxLength={140}
                    placeholder="Ej, Repuestos para flete, compra combustibles..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-hidden font-sans"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogisticsModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Guardar Flujo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Modal 2: Historial Completo */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <span className="font-sans font-bold text-sm tracking-tight">KARDEX / MOVIMIENTOS STARE</span>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[460px] overflow-y-auto space-y-3">
                <p className="text-[11px] text-slate-400 font-sans italic leading-relaxed">
                  Historial consolidad de caja local. Los egresos en el Módulo de Adquisición ocurren al balancear las existencias pendientes de las bolsas.
                </p>

                {(movements || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-450 text-slate-400">
                    No se registran movimientos aún.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {movements.map((mov) => (
                      <div key={mov.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex items-start justify-between hover:bg-slate-50 transition-colors">
                        <div className="min-w-0 pr-4">
                          <div className="flex items-center flex-wrap gap-1.5 mb-1">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              mov.fund === 'caja_chica' 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                                : 'bg-indigo-50 border-indigo-100 text-indigo-800'
                            }`}>
                              {mov.fund === 'caja_chica' ? 'Caja Chica' : 'Adquisición'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{mov.date}</span>
                            <span className="text-[9px] font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                              {mov.method}
                            </span>
                          </div>
                          <p className="text-xs font-sans font-semibold text-slate-705 text-slate-700 leading-relaxed">
                            {mov.description}
                          </p>
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-900 flex items-center justify-end pt-1 shrink-0">
                          {mov.type === 'ingreso' ? (
                            <span className="text-emerald-700 flex items-center bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                              +S/.{mov.amount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-rose-700 flex items-center bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                              -S/.{mov.amount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
