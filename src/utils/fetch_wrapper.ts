import fetch, { BodyInit, RequestInfo, RequestInit } from 'node-fetch';

/**
 * Fetch wrapper that returns a type asserted JSON response.
 * @param url Path of resource.
 * @param options fetch init object.
 * @returns JSON response of type T.
 */
const fetcher = async <T>(url: RequestInfo, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      return Promise.reject(response);
    }
    return response.json().catch(() => ({})) as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Something went wrong: ${error.message}`);
    }
    throw new Error(`Something went wrong: ${error}`);
  }
};

/**
 * Sends a GET request to the specified resource
 * @param url Path of resource.
 * @param config fetch settings.
 * @returns JSON response of type T.
 */
export const get = async <T>(url: string, config?: RequestInit) => {
  const init = { method: 'GET', ...config };
  return await fetcher<T>(url, init);
};

/**
 * Sends a POST request to the specified resource.
 * @param url Path of resource.
 * @param body Body of POST request.
 * @param config fetch settings.
 * @returns JSON response of type T.
 */
export const post = async <T>(
  url: string,
  body: BodyInit,
  config?: RequestInit
) => {
  const init = { method: 'POST', ...config, body };
  return await fetcher<T>(url, init);
};