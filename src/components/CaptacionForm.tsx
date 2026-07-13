import React, { useState, useRef, useEffect } from 'react';
import { SocialEvent, PiuraDistrict, DonationMethod, MicroDonation, FundSourceType, MypeProfile } from '../types';
import { 
  Store, 
  Smartphone, 
  FileText, 
  Calendar, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Coins, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  X,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEvents } from '../features/events';
import { useDonations } from '../features/donations';
import { useMypes } from '../features/mypes';

// ─── Componente Local: Canvas de Confeti de Celebración a 60 FPS ───────────────
const ConfettiCanvas: React.FC<{ active: boolean; onComplete: () => void }> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const colors = [
      '#14b8a6', // Teal
      '#0d9488', // Teal oscuro
      '#f59e0b', // Amber
      '#d97706', // Amber oscuro
      '#3b82f6', // Indigo
      '#10b981', // Emerald
    ];

    const particles = Array.from({ length: 85 }, () => {
      const radius = Math.random() * 5 + 3.5;
      return {
        x: Math.random() * width,
        y: height + 10,
        radius,
        speedY: -(Math.random() * 9 + 8),
        speedX: Math.random() * 5 - 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 9 - 4.5,
        opacity: 1.0,
        gravity: 0.22,
      };
    });

    let animationId: number;
    let framesElapsed = 0;

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      let activeParticles = 0;

      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        activeParticles++;

        // Movimiento físico
        p.speedY += p.gravity;
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.speedY > 0) {
          p.opacity -= 0.014; // desvanecer al descender
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        ctx.beginPath();
        // Rectángulo rotante de confeti
        ctx.rect(-p.radius, -p.radius / 1.5, p.radius * 2, p.radius * 1.3);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });

      framesElapsed++;

      if (activeParticles > 0 && framesElapsed < 180) {
        animationId = requestAnimationFrame(render);
      } else {
        onComplete();
      }
    };

    render();

    const handleResize = () => {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[110]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};

interface CaptacionFormProps {
  events?: SocialEvent[];
  onRegisterDonation?: (
    eventId: string,
    mypeName: string,
    category: string,
    district: PiuraDistrict,
    method: DonationMethod,
    amount?: number,
    itemsDonated?: { itemName: string; qty: number }[],
    additionalData?: {
      ruc?: string;
      phone?: string;
      expiryDate?: string;
      itemCategory?: string;
      fundDestination?: FundSourceType;
      txNumber?: string;
      receiptFileName?: string;
    }
  ) => void;
  activeEventId?: string | null;
  mypes?: MypeProfile[];
  selectedMypeToDonate?: MypeProfile | null;
  onClearSelectedMype?: () => void;
}

export const CaptacionForm: React.FC<CaptacionFormProps> = ({ 
  events: propEvents, 
  onRegisterDonation: propOnRegisterDonation,
  activeEventId: propActiveEventId,
  mypes: propMypes,
  selectedMypeToDonate: propSelectedMypeToDonate,
  onClearSelectedMype: propOnClearSelectedMype
}) => {
  const { events: hookEvents } = useEvents();
  const { addDonation: hookRegisterDonation } = useDonations();
  const { mypes: hookMypes, selectedMypeToDonate: hookSelected, clearSelectedMype: hookClearSelected } = useMypes();

  const events = propEvents || hookEvents;
  const onRegisterDonation = propOnRegisterDonation || hookRegisterDonation;
  const activeEventId = propActiveEventId !== undefined ? propActiveEventId : (hookEvents[0]?.id || null);
  const mypes = propMypes || hookMypes;
  const selectedMypeToDonate = propSelectedMypeToDonate !== undefined ? propSelectedMypeToDonate : hookSelected;
  const onClearSelectedMype = propOnClearSelectedMype || hookClearSelected;
  // 1. STATE - Donor Data (MYPE)
  const [mypeName, setMypeName] = useState('');
  const [ruc, setRuc] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState<PiuraDistrict>('Piura Centro');
  const [mypeCategory, setMypeCategory] = useState('Bodega');
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger auto-fill when a Mype is pre-selected
  useEffect(() => {
    if (selectedMypeToDonate) {
      setMypeName(selectedMypeToDonate.name);
      setRuc(selectedMypeToDonate.ruc === 'PJ-SIN-RUC' ? '' : selectedMypeToDonate.ruc);
      setPhone(selectedMypeToDonate.phone === 'Sin número' ? '' : selectedMypeToDonate.phone);
      setDistrict(selectedMypeToDonate.district);
      setMypeCategory(selectedMypeToDonate.category);
    }
  }, [selectedMypeToDonate]);

  // Categories of local business
  const MYPE_CATEGORIES = [
    { value: 'Bodega', label: 'Bodega de Barrio' },
    { value: 'Panadería', label: 'Panadería / Pastelería' },
    { value: 'Farmacia', label: 'Farmacia Local' },
    { value: 'Juguería', label: 'Juguería o Serv. Alimentario' },
    { value: 'Librería', label: 'Librería / Bazar' },
    { value: 'Transporte', label: 'Asociación de Mototaxis / Fletes' },
    { value: 'Otro', label: 'Otro Comercio Vecinal' }
  ];

  // 2. STATE - Donation Type Tabs ('especie' | 'economica')
  const [activeTab, setActiveTab] = useState<'especie' | 'economica'>('especie');

  // 2A. In-Kind Goods Sub-States
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState<number | ''>('');
  const [itemCategory, setItemCategory] = useState<'Víveres' | 'Ropa' | 'Juguetes' | 'Eps/Salud'>('Víveres');
  const [expiryDate, setExpiryDate] = useState('');
  
  // Multiple items list for agile batch registering
  const [itemsList, setItemsList] = useState<{ name: string; qty: number; category: string; expiryDate?: string }[]>([]);

  // 2B. Economic Funds Sub-States
  const [cashAmount, setCashAmount] = useState<number | ''>('');
  const [fundDestination, setFundDestination] = useState<FundSourceType>('fondo_adquisicion');
  const [paymentMethod, setPaymentMethod] = useState<DonationMethod>('Yape');
  const [txNumber, setTxNumber] = useState('');
  
  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. STATE - Calendar Binding
  const [linkedEventId, setLinkedEventId] = useState<string>(activeEventId || 'stock_general');

  // Interactive local alerts / UX Feedback Helpers
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [rucError, setRucError] = useState<string | null>(null);

  // Expiry date validation alert (heat / shelf-life context of Piura)
  const checkExpiryUrgency = (dateStr: string) => {
    if (!dateStr) return null;
    const expDate = new Date(dateStr);
    const today = new Date('2026-06-03'); // Simulated STARE today's timeline
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { level: 'expired', text: '¡El producto ya venció! No procesar para consumo humano.' };
    if (diffDays <= 7) return { level: 'critical', text: `Vence en ${diffDays} días bajo temp. extrema Piura (+32°C). ¡Distribución inmediata!` };
    if (diffDays <= 30) return { level: 'warning', text: `Vence en ${diffDays} días. Priorizar en hito programado.` };
    return { level: 'safe', text: 'Fecha de caducidad óptima para operaciones logísticas.' };
  };

  const currentExpiryFeedback = checkExpiryUrgency(expiryDate);

  // Phone Validation (Peru Cell: 9 digits starting with 9)
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 9) {
      setPhone(digits);
      if (digits.length > 0 && (digits.length !== 9 || !digits.startsWith('9'))) {
        setPhoneError('Celular inválido (Debe iniciar con 9 y tener 9 dígitos)');
      } else {
        setPhoneError(null);
      }
    }
  };

  // RUC Validation (Peru: 11 digits starting with 10 or 20)
  const handleRucChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 11) {
      setRuc(digits);
      if (digits.length > 0 && digits.length !== 11) {
        setRucError('El RUC peruano consta de 11 dígitos.');
      } else {
        setRucError(null);
      }
    }
  };

  // Adding single item to batch in-kind list
  const handleAddItem = () => {
    if (!itemName.trim()) return;
    if (!itemQty || Number(itemQty) <= 0) return;

    setItemsList(prev => [
      ...prev,
      {
        name: itemName.trim(),
        qty: Number(itemQty),
        category: itemCategory,
        expiryDate: expiryDate || undefined
      }
    ]);

    // Fast-reset inputs to preserve UX flow
    setItemName('');
    setItemQty('');
    setExpiryDate('');
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Submit complete form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!mypeName.trim()) {
      alert('Por favor, indica el nombre de la MYPE local.');
      return;
    }

    if (phoneError || rucError) {
      alert('Por favor, revisa los errores de validación en los campos del donante.');
      return;
    }

    // Determine target event id (either general or matched)
    const eventIdValue = linkedEventId === 'stock_general' ? '' : linkedEventId;

    if (activeTab === 'especie') {
      // Must have added at least one item, if empty but they typed something, add it automatically
      let finalItems = [...itemsList];
      if (finalItems.length === 0) {
        if (itemName.trim() && itemQty && Number(itemQty) > 0) {
          finalItems.push({
            name: itemName.trim(),
            qty: Number(itemQty),
            category: itemCategory,
            expiryDate: expiryDate || undefined
          });
          setItemName('');
          setItemQty('');
          setExpiryDate('');
        } else {
          alert('Por favor, agrega al menos un artículo en especie para registrar la donación.');
          return;
        }
      }

      // Convert itemsList structure
      const itemsDonated = finalItems.map(it => ({
        itemName: it.name,
        qty: it.qty
      }));

      // Trigger standard API logic inside STARE App
      onRegisterDonation(
        eventIdValue,
        mypeName.trim(),
        mypeCategory,
        district,
        'Especie',
        undefined,
        itemsDonated,
        {
          ruc: ruc || undefined,
          phone: phone || undefined,
          expiryDate: finalItems[0]?.expiryDate || undefined,
          itemCategory: finalItems[0]?.category || undefined
        }
      );

      setShowConfetti(true);
      setSuccessMessage(`¡Aporte en Especie de "${mypeName}" registrado con éxito en el STARE!`);
      setItemsList([]);

    } else {
      // Economic
      if (!cashAmount || Number(cashAmount) <= 0) {
        alert('Por favor, indica un monto financiero válido mayor a cero.');
        return;
      }

      // Convert local UI payment channel selection into types compilation
      let methodValue: DonationMethod = 'Yape';
      if (paymentMethod === 'Plin') methodValue = 'Plin';
      else if (paymentMethod === 'Efectivo_CajaChica') methodValue = 'Efectivo_CajaChica';
      else if (paymentMethod === 'Adquisicion_Directa') methodValue = 'Adquisicion_Directa';

      // If fund is logistics, fallback to Efectivo_CajaChica, else default logic
      const adjustedMethod: DonationMethod = 
        fundDestination === 'caja_chica' ? 'Efectivo_CajaChica' : paymentMethod;

      onRegisterDonation(
        eventIdValue,
        mypeName.trim(),
        mypeCategory,
        district,
        adjustedMethod,
        Number(cashAmount),
        undefined,
        {
          ruc: ruc || undefined,
          phone: phone || undefined,
          fundDestination: fundDestination,
          txNumber: txNumber || undefined,
          receiptFileName: uploadedFileName || undefined
        }
      );

      setShowConfetti(true);
      setSuccessMessage(`¡Aporte Financiero de S/. ${Number(cashAmount).toFixed(2)} registrado y acreditado con éxito en ${fundDestination === 'caja_chica' ? 'Caja Chica' : 'Fondo de Adquisición'}!`);
      setCashAmount('');
      setTxNumber('');
      setUploadedFileName(null);
    }

    // Reset general fields
    setMypeName('');
    setRuc('');
    setPhone('');

    // Remove feedback message after 4 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  return (
    <div id="captacion-wrapper-card" className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-all">
      
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-150 pb-5">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </span>
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50/50 px-2 py-0.5 rounded-full">
              ENTORNO DE CAPTACIÓN ÁGIL
            </span>
            <h3 className="text-lg font-sans font-black text-slate-800 uppercase tracking-tight mt-0.5">
              Ficha de Entrada de Microdonaciones
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Fricción Mínima para MYPEs de Piura 🇵🇪</span>
        </div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-start gap-3 text-emerald-800"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{successMessage}</p>
              <p className="text-xs text-emerald-600 mt-1">Los balances logísticos e inventarios del calendario se han actualizado en tiempo real conforme a la regla de integridad de negocio.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS DEL DONANTE (MYPE) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
            <span className="flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-[11px]">1</span>
            <span>Identificación del Comercio Local</span>
          </div>

          {/* QUICK-FILL SELECTOR FROM THE REGISTERED MYPES REGISTRY */}
          {mypes && mypes.length > 0 && (
            <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <UserCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="font-sans">
                  <strong>¿Donante ya afiliado?</strong> Cargue sus datos fiscales al instante para omitir llenados repetitivos:
                </p>
              </div>
              <select
                onChange={(e) => {
                  const mypeId = e.target.value;
                  if (mypeId === 'custom') {
                    setMypeName('');
                    setRuc('');
                    setPhone('');
                    setDistrict('Piura Centro');
                    setMypeCategory('Bodega');
                    if (onClearSelectedMype) onClearSelectedMype();
                  } else {
                    const matched = mypes.find(m => m.id === mypeId);
                    if (matched) {
                      setMypeName(matched.name);
                      setRuc(matched.ruc === 'PJ-SIN-RUC' || matched.ruc.startsWith('PJ-SIN') ? '' : matched.ruc);
                      setPhone(matched.phone === 'Sin número' ? '' : matched.phone);
                      setDistrict(matched.district);
                      setMypeCategory(matched.category);
                    }
                  }
                }}
                value={selectedMypeToDonate?.id || (mypes.find(m => m.name === mypeName)?.id) || 'custom'}
                className="w-full md:w-auto min-w-[240px] text-xs font-bold bg-white text-indigo-900 border border-indigo-200 rounded-xl px-3 py-2 cursor-pointer shadow-3xs focus:outline-hidden"
              >
                <option value="custom">✍️ Registrar Comercial Manualmente / Nuevo</option>
                {mypes.map(m => (
                  <option key={m.id} value={m.id}>
                    🏢 {m.name} ({m.district})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Nombre de la MYPE */}
            <div>
              <label className="block text-[11px] font-sans font-bold text-slate-550 text-slate-500 mb-1 uppercase tracking-wider">
                Razón Social / Nombre Comercial *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Bodega San Ramón"
                  value={mypeName}
                  onChange={(e) => setMypeName(e.target.value)}
                  className="w-full text-xs py-2 px-3 pl-9 rounded-xl border border-slate-205 focus:border-indigo-500 focus:outline-hidden font-sans text-slate-800"
                />
              </div>
            </div>

            {/* RUC (Opcional) */}
            <div>
              <label className="block text-[11px] font-sans font-bold text-slate-550 text-slate-500 mb-1 uppercase tracking-wider">
                RUC (Opcional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="11 dígitos (Ej. 10456123984)"
                  value={ruc}
                  onChange={(e) => handleRucChange(e.target.value)}
                  className={`w-full text-xs py-2 px-3 pl-9 rounded-xl border focus:outline-hidden font-sans ${rucError ? 'border-amber-400 focus:border-amber-500' : 'border-slate-205 focus:border-indigo-500'}`}
                />
              </div>
              {rucError && <p className="text-[10px] text-amber-600 mt-1 font-sans">{rucError}</p>}
            </div>

            {/* Celular del contacto */}
            <div>
              <label className="block text-[11px] font-sans font-bold text-slate-550 text-slate-500 mb-1 uppercase tracking-wider">
                Celular del Contacto
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="9XXXXXXXX o en blanco"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full text-xs py-2 px-3 pl-9 rounded-xl border focus:outline-hidden font-sans ${phoneError ? 'border-rose-400 focus:focus:border-rose-500' : 'border-slate-205 focus:border-indigo-500'}`}
                />
              </div>
              {phoneError && <p className="text-[10px] text-rose-500 mt-1 font-sans">{phoneError}</p>}
            </div>

            {/* Distrito de Piura */}
            <div>
              <label className="block text-[11px] font-sans font-bold text-slate-550 text-slate-500 mb-1 uppercase tracking-wider">
                Ubicación / Distrito Piura
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as PiuraDistrict)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 bg-white font-sans text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="Piura Centro">Piura Centro</option>
                <option value="Catacaos">Catacaos (Bajo Piura)</option>
                <option value="Castilla">Castilla</option>
                <option value="Veintiséis de Octubre">Veintiséis de Octubre</option>
                <option value="Tambogrande">Tambogrande (Alto Piura)</option>
                <option value="Chulucanas">Chulucanas</option>
                <option value="Sechura">Sechura</option>
                <option value="Paita">Paita</option>
                <option value="Talara">Talara</option>
              </select>
            </div>

            {/* Giro del Negocio */}
            <div>
              <label className="block text-[11px] font-sans font-bold text-slate-550 text-slate-500 mb-1 uppercase tracking-wider">
                Giro del Negocio
              </label>
              <select
                value={mypeCategory}
                onChange={(e) => setMypeCategory(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 bg-white font-sans text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              >
                {MYPE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* SECCIÓN 2: TABS DINÁMICAS (TIPO DE DONACIÓN) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-2">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
              <span className="flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-[11px]">2</span>
              <span>Modalidad del Aporte Recibido</span>
            </div>
            
            {/* Dynamic tabs buttons */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('especie')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all font-sans font-semibold cursor-pointer ${
                  activeTab === 'especie' 
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-150-opacity-20' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-4 h-4 text-indigo-600" /> En Especie
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('economica')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all font-sans font-semibold cursor-pointer ${
                  activeTab === 'economica' 
                    ? 'bg-white text-slate-900 shadow-2xs border border-slate-150-opacity-20' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Coins className="w-4 h-4 text-emerald-600" /> Económica (Efectivo/Móvil)
              </button>
            </div>
          </div>

          <div className="min-h-[170px] bg-slate-50/55 border border-slate-100 p-5 rounded-2xl">
            
            {/* TAB A: DONACIÓN EN ESPECIE */}
            {activeTab === 'especie' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  
                  {/* Nombre del insumo */}
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Detalle del artículo / Insumo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Saco Arroz 50kg o Leche"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 focus:border-indigo-500 focus:outline-hidden font-sans text-slate-800 bg-white"
                    />
                  </div>

                  {/* Cantidad */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      placeholder="Uds"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 focus:border-indigo-500 focus:outline-hidden font-sans text-slate-800 bg-white"
                    />
                  </div>

                  {/* Categoría de Insumo */}
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Categoría
                    </label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value as any)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 bg-white font-sans text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Víveres">Víveres / Alimentos</option>
                      <option value="Ropa">Ropa y Abrigo</option>
                      <option value="Juguetes">Juguetes / Útiles</option>
                      <option value="Eps/Salud">Salud e Higiene</option>
                    </select>
                  </div>

                  {/* Fecha de vencimiento */}
                  <div className="md:col-span-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-sans font-bold text-slate-500 mb-1 uppercase tracking-wider text-rose-600 flex items-center gap-0.5">
                        <Clock className="w-3.5 h-3.5" /> Vencimiento (Filtro Piura)
                      </label>
                    </div>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full text-xs py-1.5 px-3 rounded-xl border border-slate-205 focus:border-indigo-500 focus:outline-hidden font-mono text-slate-800 bg-white"
                    />
                  </div>

                </div>

                {/* Expiry Alert Warning (Heat / Safety context) */}
                {expiryDate && currentExpiryFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-3 rounded-xl flex items-center gap-2 border text-xs font-sans ${
                      currentExpiryFeedback.level === 'expired' 
                        ? 'bg-rose-50 border-rose-100 text-rose-800' 
                        : currentExpiryFeedback.level === 'critical'
                        ? 'bg-amber-50 border-amber-100 text-amber-800 animate-pulse'
                        : currentExpiryFeedback.level === 'warning'
                        ? 'bg-blue-50 border-blue-100 text-blue-800'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-850 text-emerald-800'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${currentExpiryFeedback.level === 'expired' || currentExpiryFeedback.level === 'critical' ? 'text-rose-600' : 'text-blue-500'}`} />
                    <p className="font-semibold text-[11px] leading-relaxed">
                      {currentExpiryFeedback.text}
                    </p>
                  </motion.div>
                )}

                {/* Agregar insumo a la lista temporal */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!itemName.trim() || !itemQty || Number(itemQty) <= 0}
                    className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-sans font-bold transition-all ${
                      !itemName.trim() || !itemQty || Number(itemQty) <= 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100'
                        : 'bg-indigo-650 bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <Plus className="w-4 h-4" /> Agregar Insumo al Aporte
                  </button>
                </div>

                {/* Lista de insumos cargados en lote */}
                {itemsList.length > 0 && (
                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5">
                      Lote de Artículos de Microdonación en Curso:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto">
                      {itemsList.map((it, idx) => {
                        const feedback = it.expiryDate ? checkExpiryUrgency(it.expiryDate) : null;
                        return (
                          <div key={idx} className="p-2 border border-slate-100/80 rounded-lg flex items-center justify-between text-xs bg-slate-50">
                            <div>
                              <p className="font-bold text-slate-800 leading-snug">{it.name}</p>
                              <p className="text-[10px] text-slate-500">
                                {it.qty} unidades • <span className="text-slate-400 italic">{it.category}</span>
                              </p>
                              {feedback && (
                                <p className="text-[9px] font-semibold text-rose-500 font-sans mt-0.5">
                                  ⚠️ Expira: {it.expiryDate}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setItemsList(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1 px-2 rounded-lg text-rose-500 hover:bg-rose-50"
                              title="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB B: DONACIÓN ECONÓMICA (MONEY) */}
            {activeTab === 'economica' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Monto de dinero */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Monto Financiero (S/. PEN Soles)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">S/.</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        min="1"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full text-xs py-2 px-3 pl-8 rounded-xl border border-slate-205 focus:border-indigo-500 focus:outline-hidden font-mono text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  {/* Canal de Pago (Yape/Plin/Acreditación) */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Canal o Medio de Pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as DonationMethod)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 bg-white font-sans text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Yape">Yape</option>
                      <option value="Plin">Plin</option>
                      <option value="Efectivo_CajaChica">Efectivo Físico</option>
                      <option value="Adquisicion_Directa">Transferencia Interbancaria (BCP / Interbank)</option>
                    </select>
                  </div>

                  {/* Destino del fondo (Caja Chica / Compas) */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Destino de Fondos (STARE Reglas)
                    </label>
                    <select
                      value={fundDestination}
                      onChange={(e) => setFundDestination(e.target.value as FundSourceType)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 bg-white font-sans text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="fondo_adquisicion">Fondo de Adquisición Directa (Adquirir insumos faltantes de bolsa)</option>
                      <option value="caja_chica">Caja Chica Logística (Mototaxis, fletes, combustible zonal)</option>
                    </select>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  
                  {/* Número de transacción / operación */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Número de Operación / Referencial
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Op. 384591"
                      value={txNumber}
                      onChange={(e) => setTxNumber(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 focus:border-indigo-500 focus:outline-hidden font-mono text-slate-800 bg-white"
                    />
                  </div>

                  {/* Drag and Drop o File selector COMPROBANTE */}
                  <div>
                    <label className="block text-[10px] font-sans font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      Captura / Comprobante de Yape o Transferencia
                    </label>
                    
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={triggerFileSelect}
                      className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 bg-white ${
                        dragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className="hidden"
                      />
                      {uploadedFileName ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-100">
                          <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[200px]">{uploadedFileName}</span>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setUploadedFileName(null); }}
                            className="p-0.5 hover:bg-emerald-100 rounded text-emerald-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-slate-400 shrink-0" />
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Arrastra o <strong className="text-indigo-600">examina</strong> la foto de Yape (jpg, png)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 text-[10px] text-indigo-950 font-sans leading-relaxed flex items-start gap-1.5">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Regla del Módulo de Fondos:</strong> Toda microdonación líquida ingresada por este formulario se sumará de inmediato al balance contable zonal, permitiendo a los voluntarios adquirir combustible o balancear stocks urgentes mediante adquisiciones compensatorias automáticas.
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* SECCIÓN 3: VINCULACIÓN AL CALENDARIO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wider">
            <span className="flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-[11px]">3</span>
            <span>Asignación del Destinatario (Bolsa de Evento)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Selector de Eventos del Cronograma */}
            <div>
              <label className="block text-[11px] font-sans font-bold text-slate-550 text-slate-500 mb-1 uppercase tracking-wider">
                Vincular a Visita Programada
              </label>
              <select
                value={linkedEventId}
                onChange={(e) => setLinkedEventId(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-205 bg-white font-sans text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="stock_general">📦 Stock General (Amortizado / Sin evento inmediato)</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    🗓️ {evt.district} • {evt.title} ({evt.date})
                  </option>
                ))}
              </select>
            </div>

            {/* Event selected preview info */}
            <div>
              {linkedEventId !== 'stock_general' ? (
                (() => {
                  const selectedEvt = events.find(e => e.id === linkedEventId);
                  if (!selectedEvt) return null;
                  return (
                    <motion.div 
                      key={selectedEvt.id}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs flex flex-col justify-between"
                    >
                      <p className="font-bold text-slate-800 line-clamp-1">🎯 Destino: {selectedEvt.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        <strong>Ubicación:</strong> Distrito de {selectedEvt.district} • <strong>Población:</strong> {selectedEvt.targetAudience}
                      </p>
                      <span className="bg-amber-400 text-slate-900 font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded w-fit mt-1.5">
                        Bolsa de Evento Asociada
                      </span>
                    </motion.div>
                  );
                })()
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <p className="font-bold text-slate-600">📦 Destinado al Stock General de Piura</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Los recursos no se comprometen a ningún cronograma particular de manera inmediata. Permanecen disponibles en el inventario flotante para que la mesa de planeamiento configure la mejor bolsa en el Bajo Piura.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ACCIÓN PRINCIPAL DE REGISTRO */}
        <div className="pt-4 border-t border-slate-150 flex flex-col sm:flex-row justify-end items-center gap-4">
          <p className="text-[11px] text-slate-400 font-sans italic text-center sm:text-right">
            * Al presionar "Registrar Entrada", se asienta la firma digital de trazabilidad del STARE.
          </p>
          <button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold py-3 px-8 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            Registrar Entrada de Microdonación <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

      {showConfetti && <ConfettiCanvas active={showConfetti} onComplete={() => setShowConfetti(false)} />}
    </div>
  );
};
