import { configureStore } from "@reduxjs/toolkit"
import { distributorCategoriesApi } from "./distributorCategoriesApi"
import { extranetApi } from "./extranetApi"
import { productsApi } from "./productsApi"

export const store = configureStore({
  reducer: {
    [extranetApi.reducerPath]: extranetApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [distributorCategoriesApi.reducerPath]: distributorCategoriesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      extranetApi.middleware,
      productsApi.middleware,
      distributorCategoriesApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
