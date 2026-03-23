import { configureStore } from "@reduxjs/toolkit"
import { extranetApi } from "./extranetApi"

export const store = configureStore({
  reducer: {
    [extranetApi.reducerPath]: extranetApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(extranetApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
