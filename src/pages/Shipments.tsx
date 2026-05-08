import { Search, Filter, MoreHorizontal, ArrowRight, ExternalLink, Loader2, Edit2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { Shipment, ShipmentStatus } from '../types';
import { onAuthStateChanged } from 'firebase/auth';
import { OWNER_EMAIL } from '../constants';

const STATUS_OPTIONS: ShipmentStatus[] = ['Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Cancelled', 'In Warehouse'];

interface EditModalProps {
  shipment: Shipment;
  onClose: () => void;
  onSave: (updatedShipment: Shipment) => void;
}

function EditShipmentModal({ shipment, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<Shipment>({ ...shipment });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const shipmentRef = doc(db, 'shipments', shipment.id);
      const historyEntry = {
        updatedByEmail: auth.currentUser?.email || 'Unknown',
        updatedAt: new Date().toISOString(),
        status: formData.status,
        location: formData.lastUpdatedLocation,
      };

      const updateData = {
        ...formData,
        lastUpdatedDate: new Date().toISOString(),
        updatedAt: serverTimestamp(),
        updatedByEmail: auth.currentUser?.email || 'Unknown',
        history: arrayUnion(historyEntry),
      };
      // Remove id and local history from update data (we use arrayUnion for db)
      const { id, history, ...dataToSave } = updateData;
      
      await updateDoc(shipmentRef, dataToSave);
      
      // Update local state by appending to the copy
      const localUpdated = { 
        ...updateData, 
        history: [...(shipment.history || []), historyEntry] 
      } as Shipment;
      
      onSave(localUpdated);
      onClose();
    } catch (err: any) {
      console.error("Update failed:", err);
      setError(err.message || "Failed to update shipment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit2 size={20} className="text-orange-500" />
            Edit Shipment: <span className="text-orange-500">{shipment.trackingNumber}</span>
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ShipmentStatus })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Current Location</label>
              <input 
                type="text"
                value={formData.lastUpdatedLocation}
                onChange={(e) => setFormData({ ...formData, lastUpdatedLocation: e.target.value })}
                placeholder="City, Country"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Estimated Delivery</label>
              <input 
                type="date"
                value={formData.estimatedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Shipment Type</label>
              <select 
                value={formData.shipmentType || 'Parcels'}
                onChange={(e) => setFormData({ ...formData, shipmentType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="Documents">Documents</option>
                <option value="Parcels">Parcels</option>
                <option value="Fragile">Fragile</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Payment Mode</label>
              <select 
                value={formData.paymentMode || 'Prepaid'}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="Prepaid">Prepaid</option>
                <option value="COD">Cash on Delivery (COD)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Activity/Remarks</label>
              <textarea 
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                placeholder="Briefly describe the current activity..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-orange-950 font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Changes</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

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
      case 'In Warehouse': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
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
                {auth.currentUser?.email === OWNER_EMAIL && (
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-orange-500/70">Audit Trail</th>
                )}
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
                  {auth.currentUser?.email === OWNER_EMAIL && (
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto pr-2 scrollbar-none group/audit">
                        {/* Creation Info */}
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-zinc-500 font-bold uppercase truncate">By:</span>
                          <span className="text-orange-500 font-bold truncate max-w-[80px]" title={shipment.createdByEmail}>
                            {shipment.createdByEmail === OWNER_EMAIL ? 'Owner' : shipment.createdByEmail?.split('@')[0]}
                          </span>
                          <span className="text-zinc-600 font-medium ml-auto">
                            {(() => {
                              const date = (shipment as any).createdAt;
                              const dt = date?.toDate ? date.toDate() : new Date(date || Date.now());
                              return dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
                            })()}
                          </span>
                        </div>

                        {/* Recent History Entries */}
                        {shipment.history && shipment.history.length > 0 && (
                          <div className="space-y-1 mt-1 pt-1 border-t border-zinc-800/50">
                            {shipment.history.slice().reverse().map((entry, hIdx) => (
                              <div key={hIdx} className="flex items-center gap-1.5 text-[10px]">
                                <span className="text-zinc-600 font-bold uppercase">Upd:</span>
                                <span className={cn(
                                  "truncate max-w-[80px] font-bold",
                                  entry.updatedByEmail === OWNER_EMAIL ? "text-orange-500/80" : "text-zinc-400"
                                )} title={entry.updatedByEmail}>
                                  {entry.updatedByEmail === OWNER_EMAIL ? 'Owner' : entry.updatedByEmail.split('@')[0]}
                                </span>
                                <span className="text-zinc-700 font-medium ml-auto">
                                  {new Date(entry.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingShipment(shipment)}
                        className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-orange-500 transition-colors"
                        title="Edit Shipment"
                      >
                        <Edit2 size={16} />
                      </button>
                       <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <ExternalLink size={16} />
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

      <AnimatePresence>
        {editingShipment && (
          <EditShipmentModal 
            shipment={editingShipment}
            onClose={() => setEditingShipment(null)}
            onSave={(updated) => {
              setShipments(prev => prev.map(s => s.id === updated.id ? updated : s));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
