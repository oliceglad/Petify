import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout } from '../features/auth/authSlice.js'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://45.8.250.54:8000',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result?.error?.status === 401) {
    api.dispatch(logout())
  }
  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'User',
    'Pets',
    'Pet',
    'Preferences',
    'Habits',
    'Health',
    'Events',
    'Clinics',
  ],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: new URLSearchParams({
          username: email,
          password,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    }),
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    currentUser: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    listPets: builder.query({
      query: () => '/pets',
      providesTags: ['Pets'],
    }),
    getPet: builder.query({
      query: (id) => `/pets/${id}`,
      providesTags: (result, error, id) => [{ type: 'Pet', id }],
    }),
    addPet: builder.mutation({
      query: (body) => ({
        url: '/pets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pets'],
    }),
    updatePet: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pets/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Pets',
        { type: 'Pet', id },
      ],
    }),
    deletePet: builder.mutation({
      query: (id) => ({
        url: `/pets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pets'],
    }),
    getPreferences: builder.query({
      query: (petId) => `/pets/${petId}/preferences`,
      providesTags: (result, error, petId) => [
        { type: 'Preferences', id: petId },
      ],
    }),
    updatePreferences: builder.mutation({
      query: ({ petId, ...body }) => ({
        url: `/pets/${petId}/preferences`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { petId }) => [
        { type: 'Preferences', id: petId },
        { type: 'Pet', id: petId },
      ],
    }),
    listHabits: builder.query({
      query: (petId) => `/pets/${petId}/habits`,
      providesTags: (result, error, petId) => [
        { type: 'Habits', id: petId },
      ],
    }),
    addHabit: builder.mutation({
      query: ({ petId, ...body }) => ({
        url: `/pets/${petId}/habits`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { petId }) => [
        { type: 'Habits', id: petId },
      ],
    }),
    deleteHabit: builder.mutation({
      query: ({ habitId }) => ({
        url: `/habits/${habitId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Habits'],
    }),
    listHealthRecords: builder.query({
      query: (petId) => `/pets/${petId}/health-records`,
      providesTags: (result, error, petId) => [
        { type: 'Health', id: petId },
      ],
    }),
    addHealthRecord: builder.mutation({
      query: ({ petId, ...body }) => ({
        url: `/pets/${petId}/health-records`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { petId }) => [
        { type: 'Health', id: petId },
      ],
    }),
    updateHealthRecord: builder.mutation({
      query: ({ recordId, ...body }) => ({
        url: `/health-records/${recordId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Health'],
    }),
    deleteHealthRecord: builder.mutation({
      query: ({ recordId }) => ({
        url: `/health-records/${recordId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Health'],
    }),
    listEvents: builder.query({
      query: () => '/events',
      providesTags: ['Events'],
    }),
    addEvent: builder.mutation({
      query: (body) => ({
        url: '/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Events'],
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/events/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Events'],
    }),
    completeEvent: builder.mutation({
      query: (id) => ({
        url: `/events/${id}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Events'],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events'],
    }),
    searchClinics: builder.query({
      query: ({ lat, lng, radius }) => ({
        url: '/clinics/search',
        params: { lat, lng, radius },
      }),
      providesTags: ['Clinics'],
    }),
    getClinic: builder.query({
      query: (id) => `/clinics/${id}`,
      providesTags: (result, error, id) => [{ type: 'Clinics', id }],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useCurrentUserQuery,
  useListPetsQuery,
  useGetPetQuery,
  useAddPetMutation,
  useUpdatePetMutation,
  useDeletePetMutation,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useListHabitsQuery,
  useAddHabitMutation,
  useDeleteHabitMutation,
  useListHealthRecordsQuery,
  useAddHealthRecordMutation,
  useUpdateHealthRecordMutation,
  useDeleteHealthRecordMutation,
  useListEventsQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useCompleteEventMutation,
  useDeleteEventMutation,
  useSearchClinicsQuery,
  useGetClinicQuery,
} = api
