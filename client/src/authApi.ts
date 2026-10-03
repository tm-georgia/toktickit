export type UserRole = "REQUESTER" | "IT_STAFF" | "ADMINISTRATOR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
}

interface AuthResponse {
  user: User;
}

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "An unexpected error occurred.";

    try {
      const data = (await response.json()) as ApiErrorResponse;
      message = data.error?.message ?? message;
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await parseResponse<AuthResponse>(response);
  return data.user;
}

export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseResponse<AuthResponse>(response);
  return data.user;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  await parseResponse<void>(response);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<User> {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });

  const data = await parseResponse<AuthResponse>(response);
  return data.user;
}