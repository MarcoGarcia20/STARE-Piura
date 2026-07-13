<<<<<<< Updated upstream
import { useState, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { apiFetch } from '@/lib/api-client';
import { isMockMode } from '@/lib/config';

const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    nombre: 'Admin Central',
    email: 'admin@stare.pe',
    role: 'admin',
    telefono: '999888777',
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-2',
    nombre: 'Coordinador Piura',
    email: 'coordinador@stare.pe',
    role: 'coordinador',
    telefono: '912345678',
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-3',
    nombre: 'Voluntario Ruta',
    email: 'voluntario@stare.pe',
    role: 'voluntario',
    telefono: '998877665',
    activo: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-4',
    nombre: 'Inactivo Viejo',
    email: 'baja@stare.pe',
    role: 'voluntario',
    telefono: '900000001',
    activo: false,
    created_at: new Date().toISOString(),
  },
];

=======
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
>>>>>>> Stashed changes
export interface UserFormData {
  nombre: string;
  email: string;
  telefono?: string;
  role: UserRole;
<<<<<<< Updated upstream
  password?: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>(isMockMode ? INITIAL_USERS : []);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        await new Promise(r => setTimeout(r, 600));
      } else {
        const data = await apiFetch<User[]>('/users');
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: UserFormData) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        await new Promise(r => setTimeout(r, 800));
        const newUser: User = {
          id: `u-${Date.now()}`,
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono,
          role: data.role,
          activo: true,
          created_at: new Date().toISOString(),
        };
        setUsers(prev => [...prev, newUser]);
        setIsLoading(false);
        return newUser;
      }

      const newUser = await apiFetch<User>('/users/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setUsers(prev => [...prev, newUser]);
      setIsLoading(false);
      return newUser;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: Partial<UserFormData> & { activo?: boolean }) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        await new Promise(r => setTimeout(r, 800));
        setUsers(prev => prev.map(u => {
          if (u.id === id) {
            return { ...u, ...data, id: u.id, created_at: u.created_at };
          }
          return u;
        }));
        setIsLoading(false);
        return;
      }

      const updatedUser = await apiFetch<User>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedUser } : u));
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }, []);

  const toggleUserStatus = useCallback(async (id: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        await new Promise(r => setTimeout(r, 400));
        setUsers(prev => prev.map(u => u.id === id ? { ...u, activo: !currentStatus } : u));
        setIsLoading(false);
        return;
      }

      await apiFetch<User>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ activo: !currentStatus }),
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, activo: !currentStatus } : u));
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  }, []);
=======
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
>>>>>>> Stashed changes

  return {
    users,
    isLoading,
    fetchUsers,
    createUser,
<<<<<<< Updated upstream
    updateUser,
    toggleUserStatus
  };
}
=======
    updateUser: updateUserData,
    toggleUserStatus,
  };
}
>>>>>>> Stashed changes
