import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Medal,
  Dumbbell,
  Users,
  Globe2,
  TrendingUp,
  Flame,
  History,
  Database,
  UploadCloud,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (m: boolean) => void;
}

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/medal-analysis', label: 'Medal Analysis', icon: Medal },
  { to: '/sports-analysis', label: 'Sports & Disciplines', icon: Dumbbell },
  { to: '/athletes', label: 'Athletes & Participation', icon: Users },
  { to: '/regional-analysis', label: 'Regional Performance', icon: Globe2 },
  { to: '/investment-analysis', label: 'Investment & Efficiency', icon: TrendingUp, badge: 'Scenario B' },
  { to: '/host-analysis', label: 'Host-Nation Analysis', icon: Flame },
  { to: '/olympic-timeline', label: 'Olympic Timeline', icon: History },
  { to: '/data-explorer', label: 'Data Explorer', icon: Database },
  { to: '/data-management', label: 'Data Management', icon: UploadCloud },
  { to: '/methodology', label: 'Methodology & Verification', icon: FileQuestion },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-yellow-500/20 shrink-0">
              ⚡
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  OLYMPIC INTEL
                </span>
                <span className="block text-[10px] text-yellow-400 font-semibold uppercase tracking-wider">
                  1992 – 2026 Analytics
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-yellow-400 font-semibold border border-yellow-500/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* System footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950">
          {!collapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-green-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified System Data</span>
              </div>
              <p className="text-[10px] text-slate-400">
                1992-2026 Canonical Olympic Records with reproducible IOC standard metrics.
              </p>
            </div>
          ) : (
            <div className="flex justify-center text-green-400" title="System Verified">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
