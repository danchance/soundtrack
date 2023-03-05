import fetch, { BodyInit, RequestInfo, RequestInit } from 'node-fetch';

/**
 * Fetch wrapper that returns a type asserted JSON response.
 * @param url Path of resource.
 * @param options fetch init object.
 * @returns JSON response of type T.
 */
const fetcher = async <T>(url: RequestInfo, options?: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw response;
  }
  return response.json().catch(() => ({})) as Promise<T>;
};

/**
 * Sends a POST request to the specified url.
 * @param url Path of resource.
 * @param body Body of POST request.
 * @param config fetch settings.
 * @returns JSON response of type T.
 */
const post = async <T>(url: string, body: BodyInit, config?: RequestInit) => {
  const init = { method: 'POST', ...config, body };
  return await fetcher<T>(url, init);
};

export const fetchWrapper = {
  post
};
