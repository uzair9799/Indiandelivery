import React, { useState } from 'react';
import { Package, MapPin, Calendar, ClipboardList, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { ShipmentStatus } from '../types';
import { cn } from '../lib/utils';

export default function AdminAddShipment() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    trackingNumber: `IND-${Math.floor(100000 + Math.random() * 900000)}`,
    senderName: '',
    recipientName: '',
    status: 'Pending' as ShipmentStatus,
    shipmentType: 'Parcels',
    paymentMode: 'Prepaid',
    lastUpdatedLocation: '',
    remarks: '',
    lastUpdatedDate: new Date().toISOString().split('T')[0],
    estimatedDeliveryDate: '',
    origin: '',
    destination: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!auth.currentUser) {
      setError("You must be signed in as an admin to perform this action.");
      return;
    }
    
    setLoading(true);
    try {
      const shipmentId = formData.trackingNumber;
      await setDoc(doc(db, 'shipments', shipmentId), {
        ...formData,
        createdAt: serverTimestamp(),
        createdByEmail: auth.currentUser?.email || 'Unknown',
        updatedByEmail: auth.currentUser?.email || 'Unknown',
        history: []
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "Failed to register shipment. Check permissions.");
      try {
        handleFirestoreError(err, OperationType.WRITE, 'shipments/' + formData.trackingNumber);
      } catch (logErr) {
        // Log error already happened in handleFirestoreError
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">Create New Shipment</h2>
        <p className="text-zinc-400 mt-1">Register a new parcel within the Indian Delivery Ltd network.</p>
      </header>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {error && (
              <div className="md:col-span-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
                {error}
              </div>
            )}
            {/* Tracking ID */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tracking Number</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                  placeholder="e.g. IND-123456"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Current Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ShipmentStatus })}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none appearance-none"
              >
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="In Warehouse">In Warehouse</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Shipment Type and Payment Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Shipment Type</label>
              <select
                value={formData.shipmentType}
                onChange={(e) => setFormData({ ...formData, shipmentType: e.target.value })}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none appearance-none"
              >
                <option value="Documents">Documents</option>
                <option value="Parcels">Parcels</option>
                <option value="Fragile">Fragile</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none appearance-none"
              >
                <option value="Prepaid">Prepaid</option>
                <option value="COD">Cash on Delivery (COD)</option>
              </select>
            </div>

            {/* Names */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Sender Name</label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                placeholder="Sender's Full Name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recipient Name</label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                placeholder="Recipient's Full Name"
                required
              />
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Origin</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                  placeholder="City, State"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                  placeholder="City, State"
                  required
                />
              </div>
            </div>

            {/* Dynamic Info */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Current Location</label>
              <input
                type="text"
                value={formData.lastUpdatedLocation}
                onChange={(e) => setFormData({ ...formData, lastUpdatedLocation: e.target.value })}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                placeholder="Last updated city"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Remarks</label>
              <div className="relative">
                <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                  placeholder="Internal notes or public updates"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Last Update Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="date"
                  value={formData.lastUpdatedDate}
                  onChange={(e) => setFormData({ ...formData, lastUpdatedDate: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none appearance-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Estimated Delivery</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="date"
                  value={formData.estimatedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, estimatedDeliveryDate: e.target.value })}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50 outline-none appearance-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg transition-all duration-300",
                success 
                  ? "bg-emerald-500 text-white" 
                  : "bg-orange-500 text-orange-950 hover:bg-orange-400 hover:shadow-lg hover:shadow-orange-500/20"
              )}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-orange-950 border-t-transparent rounded-full" />
              ) : success ? (
                <>
                  <CheckCircle2 size={24} />
                  Shipment Registered!
                </>
              ) : (
                <>
                  <Send size={20} />
                  Confirm and Register
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="p-6 border border-zinc-800 rounded-3xl bg-orange-500/5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-orange-500" />
          </div>
          <div>
            <h4 className="text-white font-bold">Automation Enabled</h4>
            <p className="text-zinc-500 text-sm mt-1">Registering a shipment will automatically trigger a notification to the recipient via their preferred channel.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
