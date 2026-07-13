/**
 * @file src/components/ui/index.ts
 * @description Barrel export del design system de STARE Piura.
 * Importa desde aquí en lugar de rutas individuales.
 *
 * @example import { Button, Card, Input, Badge } from '@/components/ui';
 */

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Card, CardHeader, CardFooter, StatCard } from './Card';
export type { CardProps, CardVariant, StatCardProps } from './Card';

export { Input, Textarea, Select } from './Input';
export type { InputProps, TextareaProps, SelectProps } from './Input';

export { Badge, StatusBadge, CountBadge } from './Badge';
export type { BadgeProps, BadgeColor, BadgeSize, EventStatusLabel } from './Badge';

export {
  Skeleton,
  SkeletonLine,
  SkeletonCircle,
  KPICardSkeleton,
  ListItemSkeleton,
  CardSkeleton,
  TableRowSkeleton,
  SkeletonGrid,
} from './Skeleton';

export { Avatar, AvatarGroup } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

export {
  EmptyState,
  EmptyBoxIcon,
  EmptyCalendarIcon,
  EmptySearchIcon,
} from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { ToastProvider, useToast } from './Toast';
export type { ToastMessage, ToastVariant } from './Toast';

export { Dialog, ConfirmDialog } from './Dialog';
export type { DialogProps, DialogSize, ConfirmDialogProps } from './Dialog';

export { CanvasProgress } from './CanvasProgress';
export { AppleSpinner } from './AppleSpinner';
