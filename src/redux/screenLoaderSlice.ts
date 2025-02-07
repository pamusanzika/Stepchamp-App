import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface ScreenLoaderState {
  value: boolean
}

const initialState: ScreenLoaderState = {
  value: false,
}

export const screenLoaderSlice = createSlice({
  name: 'screenLoader',
  initialState,
  reducers: {
    setShowScreenLoader: (state, action: PayloadAction<boolean>) => {
        state.value = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setShowScreenLoader } = screenLoaderSlice.actions

export default screenLoaderSlice.reducer