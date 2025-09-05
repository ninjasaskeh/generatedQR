// Global shared types for API routes and client components
// Keep minimal, stable data contracts.

// Dynamic route params
export type RouteParamsId = { id: string };
export type RouteParamsIdPromise = Promise<RouteParamsId>;

// Users
export type UserUpdateBody = Partial<{
  name: string;
  email: string;
  image: string;
}>;

export type CreateUserBody = {
  email: string;
  password: string;
  name: string;
};

// QR codes mark endpoints
export type TokenBody = Partial<{
  token: string;
  qrToken: string;
}>;

// Generic API response helper types (optional, for reference)
export type ApiError = { error: string };
export type ApiSuccess<T> = { data: T };
