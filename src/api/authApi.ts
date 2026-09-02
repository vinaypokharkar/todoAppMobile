import { baseApi } from './baseApi';
import type { UserProfile } from '../types/task.types';

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    /** GET /auth/me — current user profile. 404 if /auth/sync was never called. */
    getProfile: builder.query<UserProfile, void>({
      query: () => '/auth/me',
      providesTags: [{ type: 'Profile', id: 'ME' }],
    }),

    /**
     * POST /auth/sync — upserts the Mongo profile row after every
     * sign-in. Idempotent, no request body: everything is read from the
     * verified token server-side.
     */
    syncProfile: builder.mutation<UserProfile, void>({
      query: () => ({ url: '/auth/sync', method: 'POST' }),
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),
  }),
});

export const { useGetProfileQuery, useSyncProfileMutation } = authApi;
