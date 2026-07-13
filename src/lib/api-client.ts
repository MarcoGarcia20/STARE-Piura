<<<<<<< Updated upstream
import { config, isMockMode } from './config';
import { supabase } from './supabase/client';

async function getAccessToken(): Promise<string | null> {
  if (isMockMode || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = config.laravelApiUrl.replace(/\/$/, '');
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `Error en petición Laravel API (${response.status}): ${response.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

=======
/**
 * @file src/lib/api-client.ts
 * @description Cliente HTTP centralizado para el backend Laravel de STARE Piura.
 *
 * Responsabilidades:
 *  1. Obtener el JWT vigente desde Supabase Auth (algoritmo ES256).
 *  2. Inyectarlo como `Authorization: Bearer <token>` en cada petición.
 *  3. Normalizar errores HTTP 4xx/5xx en estructuras predecibles (`ApiError`).
 *  4. Exponer `apiFetch<T>` como función pura para ser usada por los repositorios.
 *
 * Principio de Responsabilidad Única (SRP): este módulo únicamente gestiona
 * transporte HTTP autenticado. La lógica de negocio vive en los repositorios.
 */

import { config } from './config';
import { supabase } from './supabase';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

/**
 * Error estructurado retornado por el backend Laravel o por errores de red.
 */
export class ApiError extends Error {
  /** Código de estado HTTP (4xx / 5xx). 0 si es error de red sin respuesta. */
  public readonly status: number;
  /** Cuerpo del error parseado desde la respuesta JSON (si existe). */
  public readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details ?? null;
  }

  /** Verdadero cuando el error es por autenticación (401) o autorización (403). */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /** Verdadero cuando el recurso no existe (404). */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Verdadero cuando hay un error de validación del servidor (422). */
  get isValidation(): boolean {
    return this.status === 422;
  }
}

/**
 * Opciones extendidas de fetch para `apiFetch`.
 */
export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  /** Cuerpo de la petición. Será serializado automáticamente a JSON. */
  body?: unknown;
  /**
   * Si es `true`, omite la inyección del Bearer token.
   * Útil para endpoints públicos sin autenticación.
   * @default false
   */
  skipAuth?: boolean;
}

// ─── Helper interno: obtener JWT de Supabase Auth ─────────────────────────────

/**
 * Obtiene el access token JWT vigente desde la sesión de Supabase Auth.
 * Retorna `null` si no hay sesión activa o Supabase no está configurado.
 *
 * @internal
 */
async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Realiza una petición HTTP autenticada al backend Laravel.
 *
 * Inyecta automáticamente `Authorization: Bearer <JWT>` si hay sesión activa.
 * Normaliza los errores HTTP en instancias de `ApiError`.
 *
 * @template T Tipo esperado del cuerpo de la respuesta.
 * @param path  Ruta relativa al base URL (ej: `/api/organizations`).
 * @param options Opciones de fetch extendidas (ver `ApiFetchOptions`).
 * @returns Promesa con el cuerpo de la respuesta deserializado como `T`.
 * @throws {ApiError} Si la respuesta no es exitosa (status >= 400) o hay error de red.
 *
 * @example
 * // GET autenticado
 * const orgs = await apiFetch<Organization[]>('/api/organizations');
 *
 * @example
 * // POST con body
 * const org = await apiFetch<Organization>('/api/organizations', {
 *   method: 'POST',
 *   body: { nombre: 'Comedor Central', tipo: 'comedor', ... },
 * });
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  if (!config.laravelApiUrl) {
    throw new ApiError(
      'La URL de la API de Laravel (VITE_LARAVEL_API_URL) no está configurada.',
      0
    );
  }

  const { body, skipAuth = false, headers: customHeaders, ...restOptions } = options;

  // 1. Construir URL completa
  const baseUrl = config.laravelApiUrl.replace(/\/$/, '');
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  // 2. Obtener y preparar cabeceras
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(customHeaders as Record<string, string> | undefined),
  };

  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // 3. Ejecutar fetch
  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError: unknown) {
    const message =
      networkError instanceof Error
        ? networkError.message
        : 'Error de conexión desconocido';
    throw new ApiError(`Error de red al conectar con ${url}: ${message}`, 0);
  }

  // 4. Manejar respuesta vacía (204 No Content)
>>>>>>> Stashed changes
  if (response.status === 204) {
    return {} as T;
  }

<<<<<<< Updated upstream
  return response.json() as Promise<T>;
}
=======
  // 5. Parsear cuerpo de respuesta
  const contentType = response.headers.get('Content-Type') ?? '';
  const isJson = contentType.includes('application/json');

  let responseBody: unknown;
  try {
    responseBody = isJson ? await response.json() : await response.text();
  } catch {
    responseBody = null;
  }

  // 6. Manejar errores HTTP
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    if (isJson && responseBody && typeof responseBody === 'object') {
      const errorObj = responseBody as Record<string, unknown>;
      errorMessage =
        (errorObj['message'] as string) ||
        (errorObj['error'] as string) ||
        errorMessage;
    }

    throw new ApiError(errorMessage, response.status, responseBody);
  }

  return responseBody as T;
}

// ─── Métodos de conveniencia ──────────────────────────────────────────────────

/**
 * Realiza un GET autenticado al backend Laravel.
 *
 * @template T Tipo esperado de la respuesta.
 * @param path Ruta relativa (ej: `/api/organizations`).
 * @param options Opciones adicionales de fetch (sin `method` ni `body`).
 */
export const apiGet = <T>(
  path: string,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>
): Promise<T> => apiFetch<T>(path, { ...options, method: 'GET' });

/**
 * Realiza un POST autenticado al backend Laravel.
 *
 * @template T Tipo esperado de la respuesta.
 * @param path Ruta relativa.
 * @param body Cuerpo de la petición (será serializado a JSON).
 * @param options Opciones adicionales de fetch.
 */
export const apiPost = <T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>
): Promise<T> => apiFetch<T>(path, { ...options, method: 'POST', body });

/**
 * Realiza un PUT autenticado al backend Laravel.
 *
 * @template T Tipo esperado de la respuesta.
 * @param path Ruta relativa.
 * @param body Cuerpo de la petición (será serializado a JSON).
 * @param options Opciones adicionales de fetch.
 */
export const apiPut = <T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>
): Promise<T> => apiFetch<T>(path, { ...options, method: 'PUT', body });

/**
 * Realiza un DELETE autenticado al backend Laravel.
 *
 * @template T Tipo esperado de la respuesta.
 * @param path Ruta relativa.
 * @param options Opciones adicionales de fetch.
 */
export const apiDelete = <T = void>(
  path: string,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>
): Promise<T> => apiFetch<T>(path, { ...options, method: 'DELETE' });
>>>>>>> Stashed changes
