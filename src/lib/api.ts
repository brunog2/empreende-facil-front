import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Não tentar refresh em rotas de autenticação (login, register, refresh)
    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    // Se o erro for 401 e não foi tentado refresh ainda e não é rota de auth
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // Se não tem refresh token, apenas rejeitar o erro sem redirecionar
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, limpar tokens mas não redirecionar (deixa o componente tratar)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(error);
      }
    }

    // Tratar outros erros
    const errorMessage =
      (error.response?.data as any)?.message ||
      error.message ||
      "Erro ao processar requisição";

    return Promise.reject(new Error(errorMessage));
  }
);

// Função auxiliar para extrair mensagem de erro
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return (
      axiosError.response?.data?.message ||
      error.message ||
      "Erro ao processar requisição"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Erro desconhecido";
}
