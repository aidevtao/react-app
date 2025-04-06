import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { failureReducer, loadingReducer } from "@/common/utils";
import { Status } from "@/common/utils";

const initialState = {
  status: "idle",
  user: null,
  error: null,
  token: null,
};
export const register = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, thunkApi) => {
    const {
      user: { token, ...user },
    } = await agent.auth.register({ username, email, password });
  },
  { condition: (_, { getState }) => !selectIsLoading(getState()) }
);
function successReducer(state, action) {
  state.status = Status.SUCCESS;
  state.token = action.payload.token;
  state.user = action.payload.user;
  delete state.error;
}
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => initialState,
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase("login.fulfiled", successReducer)
      .addCase("register.fulfilled", successReducer)
      .addCase("getUser.fulfilled", successReducer)
      .addCase("updateUser.fulfilled", successReducer);

    builder
      .addCase("login.rejected", failureReducer)
      .addCase("login.rejected", failureReducer)
      .addCase("login.rejected", failureReducer);
    builder.addMatcher(
      (action) => /auth\/.*\/pending/.test(action.type),
      loadingReducer
    );
  },
});
const selectAuthslice = (state) => state.auth;

const selectIsLoading = (state) => selectAuthslice(state).status;

export default authSlice.reducer;
