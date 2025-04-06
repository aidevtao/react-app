export const Status = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export function failureReducer(state, action) {
  state.status = Status.FAILURE;
  state.errors = action.payload.errors;
}
export function loadingReducer(state) {
  state.status = Status.LOADING;
}
