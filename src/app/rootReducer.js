import { combineReducers } from "@reduxjs/toolkit";
import auth from "../features/auth/authSlice";
import signals from "../features/signals/signalSlice";
import mentor from "../features/mentor/mentorSlice";
import code from "../features/code/codeSlice";
import backtest from "../features/backtest/backtestSlice";
import settings from "../features/settings/settingsSlice";
import transcript from "../features/transcript/transcriptSlice";
import strategy from "../features/strategy/strategySlice";
import learning from "../features/learning/learningSlice";

const rootReducer = combineReducers({
  auth,
  signals,
  mentor,
  code,
  backtest,
  settings,
  transcript,
  strategy,
  learning,
});

export default rootReducer;
