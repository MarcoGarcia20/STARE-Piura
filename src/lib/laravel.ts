/**
 * @file src/lib/laravel.ts
 * @description Thin-wrapper de compatibilidad sobre `apiFetch<T>`.
 *
 * Mantiene la interfaz pública `laravelApi.{get,post,put,delete}` para no
 * romper el código existente, pero delega toda la lógica de red (incluyendo
 * inyección de JWT y normalización de errores) a `apiFetch<T>`.
 *
 * Para nuevo código se recomienda importar directamente las funciones de
 * `@/lib/api-client` (apiGet, apiPost, apiPut, apiDelete, apiFetch).
 */

import { config } from './config';
import { apiFetch, type ApiFetchOptions } from './api-client';

/**
 * @deprecated Usar las funciones de `@/lib/api-client` directamente.
 * Mantenido por compatibilidad con servicios y repositorios anteriores.
 */
class LaravelApiClient {
  async request<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    return apiFetch<T>(path, options);
  }

  /** @deprecated Usar `apiGet` de `@/lib/api-client`. */
  async get<T>(path: string, options?: ApiFetchOptions): Promise<T> {
    return apiFetch<T>(path, { ...options, method: 'GET' });
  }

  /** @deprecated Usar `apiPost` de `@/lib/api-client`. */
  async post<T>(path: string, body?: unknown, options?: ApiFetchOptions): Promise<T> {
    return apiFetch<T>(path, { ...options, method: 'POST', body });
  }

  /** @deprecated Usar `apiPut` de `@/lib/api-client`. */
  async put<T>(path: string, body?: unknown, options?: ApiFetchOptions): Promise<T> {
    return apiFetch<T>(path, { ...options, method: 'PUT', body });
  }

  /** @deprecated Usar `apiDelete` de `@/lib/api-client`. */
  async delete<T>(path: string, options?: ApiFetchOptions): Promise<T> {
    return apiFetch<T>(path, { ...options, method: 'DELETE' });
  }
}

export const laravelApi = new LaravelApiClient();

export const isLaravelConfigured = (): boolean => {
  return !!config.laravelApiUrl;
};
