/**
 * @file src/animations/variants.ts
 * @description Sistema centralizado de animaciones de STARE Piura.
 * Todos los springs, easings y variantes de Framer Motion se definen aquí
 * y se importan desde los componentes, garantizando consistencia visual
 * y facilitando ajustes globales.
 *
 * Filosofía: animaciones rápidas, interrumpibles, respetuosas del motion.
 * Inspiradas en Apple Human Interface Guidelines.
 */

import type { Variants, Transition } from 'motion/react';

// ─── Apple Easing ─────────────────────────────────────────────────────────────

/**
 * Easing de Apple usado en iOS/macOS.
 * Aceleración rápida al inicio, desaceleración suave al final.
 */
export const appleEase: [number, number, number, number] = [0.32, 0.72, 0, 1];

/** Easing estándar para entradas */
export const easeIn: [number, number, number, number] = [0.4, 0, 1, 1];
/** Easing estándar para salidas */
export const easeOut: [number, number, number, number] = [0, 0, 0.6, 1];
/** Easing estándar para transiciones */
export const easeInOut: [number, number, number, number] = [0.4, 0, 0.2, 1];

// ─── Springs ──────────────────────────────────────────────────────────────────

export const springs = {
  /** Suave – para modales, paneles largos */
  soft: {
    type: 'spring',
    stiffness: 120,
    damping: 20,
    mass: 1,
  } as Transition,

  /** Normal – para la mayoría de transiciones */
  normal: {
    type: 'spring',
    stiffness: 200,
    damping: 24,
    mass: 1,
  } as Transition,

  /** Rápido – para feedback inmediato (botones, badges) */
  snappy: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  } as Transition,

  /** Con rebote – para acciones exitosas, notificaciones */
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 17,
    mass: 0.8,
  } as Transition,

  /** Rígido – para elementos pequeños (dot, badge) */
  stiff: {
    type: 'spring',
    stiffness: 600,
    damping: 35,
    mass: 0.5,
  } as Transition,
} as const;

// ─── Page Transitions ─────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springs.soft,
      opacity: { duration: 0.2, ease: easeOut },
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    transition: {
      duration: 0.15,
      ease: easeIn,
    },
  },
};

// ─── Fade Variants ────────────────────────────────────────────────────────────

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: easeOut } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: easeIn } },
};

export const fadeUpVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: appleEase } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15, ease: easeIn } },
};

// ─── Stagger Lists ────────────────────────────────────────────────────────────

/**
 * Contenedor de lista con efecto stagger.
 * Los hijos usan listItemVariants.
 */
export const listContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

/**
 * Ítem individual de lista animado.
 * fade + slide-up con spring suave.
 */
export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.soft,
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.15, ease: easeIn },
  },
};

// ─── Modal / Dialog ───────────────────────────────────────────────────────────

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: easeOut } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: easeIn } },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.normal,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { duration: 0.15, ease: easeIn },
  },
};

/** Bottom sheet para mobile */
export const bottomSheetVariants: Variants = {
  initial: { opacity: 0, y: '100%' },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.soft,
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.2, ease: easeIn },
  },
};

// ─── Toast / Notification ─────────────────────────────────────────────────────

export const toastVariants: Variants = {
  initial: { opacity: 0, x: 40, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springs.bouncy,
  },
  exit: {
    opacity: 0,
    x: 40,
    scale: 0.95,
    transition: { duration: 0.15, ease: easeIn },
  },
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const sidebarVariants: Variants = {
  expanded: {
    width: 256,
    transition: springs.snappy,
  },
  collapsed: {
    width: 68,
    transition: springs.snappy,
  },
};

export const sidebarLabelVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    display: 'block',
    transition: { duration: 0.2, ease: appleEase, delay: 0.05 },
  },
  collapsed: {
    opacity: 0,
    x: -8,
    transitionEnd: { display: 'none' },
    transition: { duration: 0.1, ease: easeIn },
  },
};

// ─── Card Hover ───────────────────────────────────────────────────────────────

export const cardHoverVariants = {
  rest: { scale: 1, boxShadow: 'var(--shadow-sm)' },
  hover: {
    scale: 1.01,
    boxShadow: 'var(--shadow-md)',
    transition: springs.snappy,
  },
};

// ─── Button ───────────────────────────────────────────────────────────────────

export const buttonTapVariants = {
  whileTap: { scale: 0.97, transition: springs.stiff },
  whileHover: { scale: 1.02, transition: springs.stiff },
};

// ─── Shared Element (Layout animations) ──────────────────────────────────────

/** Transición de layout suave para elementos compartidos entre rutas */
export const sharedLayoutTransition: Transition = {
  ...springs.soft,
};

// ─── Accordion / Collapse ─────────────────────────────────────────────────────

export const accordionVariants: Variants = {
  open:   { height: 'auto', opacity: 1, transition: { ...springs.soft, opacity: { duration: 0.2 } } },
  closed: { height: 0, opacity: 0, transition: { ...springs.snappy, opacity: { duration: 0.15 } } },
};
