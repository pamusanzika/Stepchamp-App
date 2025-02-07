import { configureStore } from '@reduxjs/toolkit'
import ScreenLoaderReducer from './screenLoaderSlice'
import LoginErrorMessageReducer from './LoginErrorMessageSlice'

export const store = configureStore({
  reducer: {
    screenLaoder: ScreenLoaderReducer,
    loginErrorMessage: LoginErrorMessageReducer
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch