import React, { useState } from 'react';
import { Search, MapPin, Truck, Calendar, Clock, AlertCircle, ArrowRight, User, UserCheck, Package, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Shipment, ShipmentStatus } from '../types';
import { cn } from '../lib/utils';

export default function PublicTracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);
    setShipment(null);

    try {
      const docRef = doc(db, 'shipments', trackingNumber.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setShipment({ id: docSnap.id, ...docSnap.data() } as Shipment);
      } else {
        setError('No shipment found with this tracking number. Please check and try again.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'shipments/' + trackingNumber);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'In Transit': return 'text-blue-500';
      case 'Delivered': return 'text-emerald-500';
      case 'Out for Delivery': return 'text-orange-500';
      case 'Delayed': return 'text-rose-500';
      case 'Pending': return 'text-orange-500';
      case 'In Warehouse': return 'text-amber-500';
      default: return 'text-zinc-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-4 pt-10">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
          Track Your <span className="text-orange-500">Journey</span>
        </h2>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Enter your Indian Delivery Ltd tracking ID below for real-time visibility and status updates.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-orange-500/20 shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)] blur-2xl rounded-3xl group-focus-within:bg-orange-500/30 transition-all" />
          <div className="relative flex items-center bg-zinc-900 border border-zinc-800 p-2 rounded-2xl shadow-2xl">
            <Search className="ml-4 text-zinc-500" size={24} />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. IND-123456"
              className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white text-lg font-medium placeholder:text-zinc-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-400 text-orange-950 font-bold px-8 py-4 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-orange-950 border-t-transparent rounded-full" /> : 'Track'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center justify-center max-w-xl mx-auto"
          >
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        {shipment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Status Overview */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none" />
               
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Shipment Status</p>
                    <div className="flex items-center gap-3">
                       <h3 className={cn("text-3xl font-black italic uppercase", getStatusColor(shipment.status))}>
                          {shipment.status}
                       </h3>
                       <div className={cn("w-3 h-3 rounded-full animate-pulse", 
                          shipment.status === 'Delivered' ? 'bg-emerald-500' : 'bg-orange-500'
                       )} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                     <div className="text-right">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Est. Delivery</p>
                        <p className="text-white font-bold text-lg">{shipment.estimatedDeliveryDate}</p>
                     </div>
                     <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
                        <Calendar className="text-orange-500" size={24} />
                     </div>
                  </div>
               </div>

               <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-800 pt-8">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="mt-1"><MapPin size={18} className="text-zinc-600" /></div>
                       <div>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Origin</p>
                          <p className="text-white font-bold mt-1">{shipment.origin}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="mt-1"><Truck size={18} className="text-zinc-600" /></div>
                       <div>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Destination</p>
                          <p className="text-white font-bold mt-1">{shipment.destination}</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="mt-1"><Clock size={18} className="text-zinc-600" /></div>
                       <div>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Last Updated</p>
                          <p className="text-white font-bold mt-1">{shipment.lastUpdatedDate} in {shipment.lastUpdatedLocation}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="mt-1"><AlertCircle size={18} className="text-zinc-600" /></div>
                       <div>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Remarks</p>
                          <p className="text-zinc-300 italic mt-1">"{shipment.remarks || 'No specific remarks available for this stage.'}"</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Sender and Recipient Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md flex items-center gap-5">
                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 shrink-0">
                  <User className="text-zinc-400" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Sender</p>
                  <p className="text-white font-bold text-lg">{shipment.senderName}</p>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md flex items-center gap-5">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 shrink-0">
                  <UserCheck className="text-orange-500" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Recipient</p>
                  <p className="text-white font-bold text-lg">{shipment.recipientName}</p>
                </div>
              </div>
            </div>

            {/* Shipment Type and Payment Mode Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-md flex items-center gap-5">
                <div className="w-10 h-10 bg-zinc-800/50 rounded-xl flex items-center justify-center border border-zinc-700 shrink-0">
                  <Package className="text-zinc-500" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">Shipment Type</p>
                  <p className="text-zinc-300 font-bold text-base">{shipment.shipmentType || 'Standard Parcel'}</p>
                </div>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 backdrop-blur-md flex items-center gap-5">
                <div className="w-10 h-10 bg-emerald-500/5 rounded-xl flex items-center justify-center border border-emerald-500/10 shrink-0">
                  <CreditCard className="text-emerald-500/70" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">Mode of Payment</p>
                  <p className="text-emerald-500/90 font-bold text-base">{shipment.paymentMode || 'Prepaid'}</p>
                </div>
              </div>
            </div>

            {/* Path visualization */}
            <div className="p-8 bg-zinc-900 flex items-center justify-center rounded-3xl border border-zinc-800">
                <div className="w-full flex items-center gap-2">
                   <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-4 h-4 rounded-full bg-emerald-500" />
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Picked Up</p>
                   </div>
                   <div className={cn("h-1 flex-1 rounded-full", shipment.status !== 'Pending' ? 'bg-emerald-500' : 'bg-zinc-800')} />
                   <div className="flex flex-col items-center gap-2 flex-1">
                      <div className={cn("w-4 h-4 rounded-full", shipment.status !== 'Pending' ? 'bg-emerald-500' : 'bg-zinc-800')} />
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">In Transit</p>
                   </div>
                   <div className={cn("h-1 flex-1 rounded-full", (shipment.status === 'Delivered' || shipment.status === 'Out for Delivery') ? 'bg-emerald-500' : 'bg-zinc-800')} />
                   <div className="flex flex-col items-center gap-2 flex-1">
                      <div className={cn("w-4 h-4 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]", shipment.status === 'Delivered' ? 'bg-emerald-500' : 'bg-zinc-800')} />
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Delivered</p>
                   </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
