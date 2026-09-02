import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { getAuth } from '@react-native-firebase/auth';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config/env';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  prepareHeaders: async headers => {
    // Pull a FRESH token on every request. The Firebase SDK returns the
    // cached one and transparently refreshes it when it is close to
    // expiry, so there is no manual expiry bookkeeping to get wrong.
    const user = getAuth().currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * On a 401, force-refresh the token once and retry. Covers the edge case
 * where the cached token expired between prepareHeaders and the server
 * verifying it, or where the user's claims were revoked.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      const user = getAuth().currentUser;
      if (user) {
        await user.getIdToken(true); // force refresh
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
