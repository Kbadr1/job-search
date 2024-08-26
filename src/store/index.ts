import { combineReducers, configureStore } from "@reduxjs/toolkit";
import jobsSlice from './jobs/jobsSlice';
import storage from 'redux-persist/lib/storage'; 
import { persistReducer, persistStore } from "redux-persist";
import createFilter from 'redux-persist-transform-filter';

const saveSearchHistoryFilter = createFilter(
  'jobs', 
  ['searchHistory']   
);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['jobs'], 
  transforms: [saveSearchHistoryFilter], 
};

const rootReducer = combineReducers({
  jobs: jobsSlice, 
});


const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
