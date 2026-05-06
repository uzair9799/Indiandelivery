import { MapPin, Truck, CheckCircle2, Circle, Navigation, Share2, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { TRACKING_STEPS } from '../constants';
import { cn } from '../lib/utils';

export default function Tracking() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Real-time Tracking</h2>
          <p className="text-zinc-400 mt-1">Live visibility of shipment <span className="text-orange-500 font-mono">SP-100234</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400">
            <Share2 size={18} />
          </button>
          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 text-zinc-400">
            <Printer size={18} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Simulation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-700 group">
            {/* Simulation of a map with SVG */}
            <svg className="w-full h-full opacity-40" viewBox="0 0 800 450">
               <path d="M100 100 Q 400 50, 700 350" stroke="#f97316" strokeWidth="3" fill="none" strokeDasharray="8 8" />
               <motion.circle 
                cx="100" cy="100" r="8" fill="#f97316" 
                animate={{ r: [6, 12, 6] }}
                transition={{ repeat: Infinity, duration: 2 }}
               />
               <motion.circle 
                cx="700" cy="350" r="12" fill="#3b82f6" 
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
               />
               {/* Roads/Grids simulation */}
               <path d="M0 50 L800 50 M0 150 L800 150 M0 250 L800 250 M0 350 L800 350" stroke="#3f3f46" strokeWidth="1" />
               <path d="M100 0 L100 450 M300 0 L300 450 M500 0 L500 450 M700 0 L700 450" stroke="#3f3f46" strokeWidth="1" />
            </svg>

            {/* Truck cursor */}
            <motion.div 
               animate={{ x: [100, 400, 700], y: [100, 50, 350] }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute z-10 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50"
            >
              <Navigation className="text-amber-950 fill-current rotate-45" size={20} />
            </motion.div>

            <div className="absolute top-6 left-6 p-4 bg-[#09090b]/80 backdrop-blur-md rounded-2xl border border-zinc-800">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-300">LIVE: MOVING WEST</span>
               </div>
               <p className="text-lg font-bold text-white mt-1">45.2 km/h</p>
            </div>

            <div className="absolute bottom-6 right-6 flex gap-2">
               <div className="p-3 bg-[#09090b]/80 backdrop-blur-md rounded-xl border border-zinc-800 text-white font-bold text-sm">
                  ETA: 2h 45m
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Carrier', value: 'DHL Express' },
              { label: 'Weight', value: '2.45 kg' },
              { label: 'Dimensions', value: '30 x 20 x 15 cm' },
              { label: 'Type', value: 'Electronics / Fragile' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{item.label}</p>
                <p className="text-sm font-bold text-white mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="p-8 bg-zinc-900/50 border border-zinc-800/50 rounded-3xl backdrop-blur-sm h-fit">
          <h3 className="text-xl font-bold text-white mb-8">Shipment Progress</h3>
          <div className="relative space-y-10">
            {/* Timeline Line */}
            <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-zinc-800" />

            {TRACKING_STEPS.map((step, idx) => (
              <div key={idx} className="relative flex gap-6 pl-10 group">
                {/* Dot */}
                <div className={cn(
                  "absolute left-0 top-1 w-7 h-7 rounded-full border-4 border-[#09090b] flex items-center justify-center z-10 transition-colors",
                  idx === 0 ? "bg-orange-500" : "bg-zinc-800 group-hover:bg-zinc-700"
                )}>
                  {idx === 0 ? <Truck size={14} className="text-orange-950" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                    <h4 className={cn(
                      "text-sm font-bold",
                      idx === 0 ? "text-orange-500" : "text-white"
                    )}>{step.status}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono">{step.date}</span>
                  </div>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <MapPin size={10} />
                    {step.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-zinc-800/30 rounded-2xl border border-zinc-700/30">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-700 border border-zinc-600">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Courier" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 font-medium">Assigned Courier</p>
                <p className="text-sm font-bold text-white">James Harrison</p>
                <div className="mt-2 flex items-center gap-2">
                  <button className="px-3 py-1 bg-orange-500 text-orange-950 text-[10px] font-bold rounded-lg hover:bg-orange-400 transition-colors">Call Courier</button>
                  <button className="px-3 py-1 bg-zinc-700 text-white text-[10px] font-bold rounded-lg hover:bg-zinc-600 transition-colors">Message</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
