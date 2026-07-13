/**
 * @file src/layouts/BottomNav.tsx
 * @description Navegación inferior para mobile/tablet (<1024px).
 * 5 items principales con indicador activo animado (layoutId).
 * Safe area padding para dispositivos con notch/home bar.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  HandHeart,
  BarChart3,
  CalendarDays,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { springs } from '@/animations/variants';
import type { ActiveScreen } from '@/app/config/app.config';
import { useAuthStore } from '@/stores/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

// ─── Nav Items ────────────────────────────────────────────────────────────────

const navItems: Array<{
  id: ActiveScreen;
  label: string;
  icon: React.ElementType;
}> = [
  { id: 'dashboard',      label: 'Inicio',         icon: LayoutDashboard },
  { id: 'captacion',      label: 'Donaciones',     icon: HandHeart },
  { id: 'balance',        label: 'Balance',        icon: BarChart3 },
  { id: 'organizaciones', label: 'Orgs.',          icon: Building2 },
  { id: 'eventos',        label: 'Eventos',        icon: CalendarDays },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const { user } = useAuthStore();

  const filteredNavItems = navItems.filter((item) => {
    if (item.id === 'balance') {
      return user?.role === 'admin';
    }
    return true;
  });

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-[var(--z-sidebar)]',
        'lg:hidden', // Solo visible en mobile/tablet
        'glass border-t border-[var(--color-border)]',
        'shadow-[var(--shadow-lg)]',
        // Safe area
        'pb-safe pb-[env(safe-area-inset-bottom)]'
      )}
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch h-16">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileTap={{ scale: 0.92, transition: springs.stiff }}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-1',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                'transition-colors duration-150',
                isActive
                  ? 'text-teal-600'
                  : 'text-[var(--color-text-tertiary)]'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-x-2 inset-y-1 bg-teal-50 rounded-[var(--radius-lg)]"
                  transition={springs.snappy}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={
                  isActive
                    ? { scale: 1.1, y: -1, transition: springs.bouncy }
                    : { scale: 1, y: 0, transition: springs.snappy }
                }
                className="relative z-10"
              >
                <Icon className="w-5 h-5" aria-hidden />
              </motion.div>

              {/* Label */}
              <motion.span
                animate={
                  isActive
                    ? { opacity: 1, fontWeight: '600', transition: { duration: 0.15 } }
                    : { opacity: 0.7, fontWeight: '400', transition: { duration: 0.15 } }
                }
                className="relative z-10 text-[10px] leading-none"
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
