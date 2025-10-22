import { API_BASE_URL } from './constants';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiClient<T>(
  endpoint: string,
  { token, headers, ...customConfig }: RequestOptions = {}
): Promise<T> {
  const config: RequestInit = {
    method: customConfig.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...customConfig,
  };

  if (token) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  } else {
    // Si aucun token n'est fourni, essayez de le récupérer du localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${storedToken}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let data;
  try {
    const response = await fetch(url, config);
    data = await response.json();

    if (response.ok) {
      return data;
    }
    // Gérer les erreurs HTTP (ex: 401, 404, 500)
    const error = new Error(data?.message || response.statusText);
    (error as any).status = response.status;
    (error as any).data = data;
    return Promise.reject(error);
  } catch (error) {
    // Gérer les erreurs réseau ou autres
    console.error('API Client Error:', error);
    return Promise.reject(error);
  }
}
