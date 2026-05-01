import { createApiClient } from "@nuro/contracts";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const api = createApiClient(baseUrl);
