import { http } from '../lib/http';

export function resourceClient<T extends { id: number }>(base: string) {
  const baseUrl = base.endsWith('/') ? base : `${base}/`;
  return {
    list: (params?: any) => http.get<T[]>(baseUrl, { params }).then(r => r.data),
    get: (id: number) => http.get<T>(`${baseUrl}${id}/`).then(r => r.data),
    create: (payload: Partial<T>) => http.post<T>(baseUrl, payload).then(r => r.data),
    update: (id: number, payload: Partial<T>) => http.put<T>(`${baseUrl}${id}/`, payload).then(r => r.data),
    patch: (id: number, payload: Partial<T>) => http.patch<T>(`${baseUrl}${id}/`, payload).then(r => r.data),
    remove: (id: number) => http.delete(`${baseUrl}${id}/`).then(r => r.status === 204),
  };
}