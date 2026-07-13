/**
 * @file src/hooks/useUserManagement.ts
 * @description Hook de compatibilidad para los componentes de gestión de usuarios.
 *
 * Mantiene la interfaz pública anterior (UserFormData, useUserManagement)
 * pero ahora delega a `useUsers` que está conectado al store real/mock,
 * en lugar de usar datos hardcodeados en memoria.
 *
 * @deprecated Para nuevo código usar directamente `useUsers` de `@/hooks/useUsers`.
 */

import { useUsers } from './useUsers';
import type { UserRole } from '@/types/index';

/** Datos del formulario de creación/edición de usuario. */
export interface UserFormData {
  nombre: string;
  email: string;
  telefono?: string;
  role: UserRole;
  /** Contraseña inicial para la creación del usuario. Solo aplica en `register`. */
  password?: string;
}

/**
 * Hook de gestión de usuarios.
 * Adaptador entre los componentes existentes y el nuevo `useUsers`.
 *
 * @returns Estado y acciones para gestionar usuarios del sistema.
 */
export function useUserManagement() {
  const {
    users,
    isLoading,
    fetchUsers,
    registerUser,
    updateUser,
    toggleUserStatus,
  } = useUsers();

  /**
   * Crea un nuevo usuario en el sistema.
   * Internamente usa `registerUser` del store, que llama al endpoint
   * `POST /api/users/register` en Laravel (crea en Auth + BD de forma atómica).
   *
   * @param data Formulario de creación de usuario.
   */
  const createUser = (data: UserFormData) => {
    if (!data.password) {
      return Promise.reject(new Error('La contraseña es requerida para crear un usuario.'));
    }
    return registerUser({
      email: data.email,
      password: data.password,
      nombre: data.nombre,
      role: data.role,
      telefono: data.telefono,
    });
  };

  /**
   * Actualiza los datos de un usuario existente.
   * @param id   UUID del usuario.
   * @param data Campos a actualizar (nombre, rol, teléfono, activo).
   */
  const updateUserData = (
    id: string,
    data: Partial<UserFormData> & { activo?: boolean }
  ) => {
    return updateUser(id, {
      nombre: data.nombre,
      role: data.role,
      telefono: data.telefono,
      activo: data.activo,
    });
  };

  return {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser: updateUserData,
    toggleUserStatus,
  };
}
