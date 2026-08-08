import { Metadata } from "next";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Under Maintenance | EvoSport",
  description: "EvoSport is currently undergoing scheduled system updates. We will be back online shortly.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-900/60 flex items-center justify-center mx-auto">
          <Wrench className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-950/60 border border-rose-900/60 px-3 py-1 rounded-full">
            SYSTEM MAINTENANCE
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white pt-2">
            WE&apos;LL BE BACK SHORTLY
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            EvoSport is currently undergoing scheduled platform upgrades to improve performance and inventory systems. Thank you for your patience.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-900 text-[10px] text-neutral-600 uppercase font-mono">
          EvoSport Performance Commerce Platform • 503 Maintenance
        </div>
      </div>
    </div>
  );
}
