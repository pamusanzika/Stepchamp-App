import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface LoginErrorMessage {
  message?: string | null,
  isError: boolean
}

const initialState: LoginErrorMessage = {
  message: null,
  isError: false
}

export const LoginErrorMessageSlice = createSlice({
  name: 'loginErrorMessage',
  initialState,
  reducers: {
    setLoginErrorMessage: (state, action: PayloadAction<{isError: boolean, message: string | null}>) => {
        state.isError = action.payload.isError
        state.message = action.payload.message
    }
  },
})

// Action creators are generated for each case reducer function
export const { setLoginErrorMessage } = LoginErrorMessageSlice.actions

export default LoginErrorMessageSlice.reducer