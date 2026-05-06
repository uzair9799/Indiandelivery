import { User, Bell, Shield, Wallet, Globe, Mail, Phone, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
  const sections = [
    { title: 'Account Settings', desc: 'Manage your personal profile and account credentials', icon: User, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Notifications', desc: 'Configure alerts for shipment updates and milestones', icon: Bell, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Security & Privacy', desc: 'Control your session security and API keys', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Billing & Plans', desc: 'View invoices and manage your subscription', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Language & Region', desc: 'Set default units and regional preferences', icon: Globe, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-zinc-400 mt-1">Configure your ShipmentPro platform preferences</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
           <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-800 bg-zinc-700 shadow-xl group-hover:scale-105 transition-transform">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Uzair" alt="User" className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-orange-500 rounded-full border-4 border-[#09090b] text-orange-950">
                  <User size={14} fill="currentColor" />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white mt-4">Uzair Ahmed</h3>
              <p className="text-zinc-500 text-sm">Managing Director, Global Logistics</p>
           </div>

           <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700/30">
                 <Mail size={18} className="text-zinc-500" />
                 <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Email Address</p>
                    <p className="text-sm font-medium text-white">uzair9799@gmail.com</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700/30">
                 <Phone size={18} className="text-zinc-500" />
                 <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-zinc-500">Phone</p>
                    <p className="text-sm font-medium text-white">+1 (555) 000-1234</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <button
              key={section.title}
              className="w-full flex items-center gap-4 p-5 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:bg-zinc-800 transition-all group group cursor-pointer text-left"
            >
              <div className={cn("p-2 rounded-xl", section.bg)}>
                <section.icon size={20} className={section.color} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors">{section.title}</h4>
                <p className="text-xs text-zinc-500 mt-0.5">{section.desc}</p>
              </div>
              <ChevronRight size={16} className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl border-dashed">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-lg font-bold text-white">Advanced Configuration</h3>
               <p className="text-sm text-zinc-500 mt-1">Configure webhooks and custom API integrations for your ERP system.</p>
            </div>
            <button className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-xl transition-all">
               Open Developer Console
            </button>
         </div>
      </div>
    </div>
  );
}
