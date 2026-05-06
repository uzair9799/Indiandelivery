import { Search, Filter, MoreHorizontal, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { Shipment, ShipmentStatus } from '../types';
import { onAuthStateChanged } from 'firebase/auth';

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchShipments();
      } else {
        setLoading(false);
      }
    });

    async function fetchShipments() {
      try {
        const q = query(collection(db, 'shipments'), orderBy('createdAt', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment));
        setShipments(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'shipments');
      } finally {
        setLoading(false);
      }
    }

    return () => unsubscribe();
  }, []);
  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'In Transit': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Delivered': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Delayed': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'Pending': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Out for Delivery': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Shipments</h2>
          <p className="text-zinc-400 mt-1">Manage and track your global fleet performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search tracking ID, sender..."
              className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-[240px] md:w-[320px]"
            />
          </div>
          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
            <Filter size={20} className="text-zinc-400" />
          </button>
        </div>
      </header>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Tracking Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Origin / Destination</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Est. Delivery</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-orange-500" size={32} />
                    <p className="text-zinc-500 mt-4 font-medium">Loading shipments...</p>
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-500">
                    No shipments found. Start by creating one from the sidebar.
                  </td>
                </tr>
              ) : shipments.map((shipment, idx) => (
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={shipment.id}
                  className="group hover:bg-zinc-800/30 transition-all border-b border-zinc-800/50 last:border-0"
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors">{shipment.trackingNumber}</span>
                      <span className="text-xs text-zinc-500 font-mono mt-0.5">{shipment.senderName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{shipment.origin?.split(',')[0]}</span>
                        <span className="text-[10px] text-zinc-500 uppercase">{shipment.origin?.split(',')[1]}</span>
                      </div>
                      <ArrowRight size={14} className="text-zinc-700" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{shipment.destination?.split(',')[0]}</span>
                        <span className="text-[10px] text-zinc-500 uppercase">{shipment.destination?.split(',')[1]}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      getStatusColor(shipment.status)
                    )}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-zinc-400">{shipment.estimatedDeliveryDate}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <p className="text-xs text-zinc-500 font-medium">Showing <span className="text-white">{shipments.length}</span> of <span className="text-white">...</span> active shipments</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-xs font-bold text-zinc-400 hover:text-white transition-colors disabled:opacity-30" disabled>Previous</button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg bg-orange-500 text-orange-950 font-bold text-xs">1</button>
              <button className="w-8 h-8 rounded-lg hover:bg-zinc-800 text-zinc-400 font-bold text-xs transition-colors">2</button>
              <button className="w-8 h-8 rounded-lg hover:bg-zinc-800 text-zinc-400 font-bold text-xs transition-colors">3</button>
            </div>
            <button className="px-3 py-1 text-xs font-bold text-zinc-400 hover:text-white transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
