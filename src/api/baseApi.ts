import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { getClerkInstance } from '@clerk/expo';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config/env';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  prepareHeaders: async headers => {
    // Pull a FRESH token on every request. Clerk returns the cached one and
    // transparently refreshes it when it is close to expiry, so there is no
    // manual expiry bookkeeping to get wrong.
    const token = await getClerkInstance().session?.getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * On a 401, force-refresh the token once and retry. Covers the edge case
 * where the cached token expired between prepareHeaders and the server
 * verifying it.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      const session = getClerkInstance().session;
      if (session) {
        await session.getToken({ skipCache: true }); // force refresh
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }
    return result;
  };

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Task', 'Stats', 'Profile'],
  endpoints: () => ({}), // injected by feature files
});
