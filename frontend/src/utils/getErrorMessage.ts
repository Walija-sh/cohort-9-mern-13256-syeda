import { AxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return (error.response?.data?.message as string | undefined) || fallback;
  }
  return fallback;
}
