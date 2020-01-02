import { createStore } from "redux";

const INITIAL_STATE = {
  loggedIn: false,
  userdata: [],
  allJourneys: [],
  allPlans: [],
  queryJourney: "",
  queryPlan: "",
  displayModal: "none"
};

let reducer = (state, action) => {
  if (action.type === "login-success") {
    return { ...state, loggedIn: true, userdata: action.userdata };
  }
  if (action.type === "clearSearch") {
    return { ...state, queryJourney: "", queryPlan: "" };
  }
  if (action.type === "signout") {
    return {
      loggedIn: false,
      userdata: []
    };
  }
  if (action.type === "update-posts") {
    return {
      ...state,
      allJourneys: action.allJourneys,
      allPlans: action.allPlans
    };
  }
  if (action.type === "search Journey Query") {
    return {
      ...state,
      queryJourney: action.search
    };
  }
  if (action.type === "search Plan Query") {
    return {
      ...state,
      queryPlan: action.search
    };
  }
  if (action.type === "showModal") {
    return { ...state, displayModal: action.show };
  }
  return state;
};

const store = createStore(
  reducer,
  INITIAL_STATE,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
