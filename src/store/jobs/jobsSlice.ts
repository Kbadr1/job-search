import { createSlice } from "@reduxjs/toolkit";
import { REHYDRATE } from 'redux-persist'; 
import { RehydrateAction, TJobsState } from "../../types"; 
import { fetchJobs } from "../jobs/thunks/fetchJobs";
import { fetchJobById } from "../jobs/thunks/fetchJobById";
import { fetchSkillById } from "../jobs/thunks/fetchSkillById";

const initialState: TJobsState = {
  entities: {
    jobs: {},
    skills: {},
  },
  loading: false,
  error: null,
  count: 0,
  next: 12,
  searchQuery: '',
  searchHistory: [], 
  cursor: 0, 
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: { 
    setSearchQuery(state, action) {  
      state.searchQuery = action.payload;
    },
    clearHistory(state) {
      state.searchHistory = [];
    },
    setCursor(state, action) {
      state.cursor = action.payload;
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchJobs.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      if (action.payload) {
        return {
          ...state,
          ...action.payload.jobs,
        };
      }
    });
    builder.addCase(fetchJobs.fulfilled, (state: TJobsState, action) => {
      state.loading = false;
    
      const newJobs = action.payload?.entities?.jobs || {};
      const newSkills = action.payload?.entities?.skills || {};
    
      if (action.payload.isNewSearch) {
        state.entities.jobs = newJobs;
        state.entities.skills = newSkills;
      } else {
        state.entities.jobs = {
          ...state.entities.jobs,
          ...newJobs,
        };
        state.entities.skills = {
          ...state.entities.skills,
          ...newSkills,
        };
      }
    
      state.error = null;
      state.count = action.payload.count;
      state.next = action.payload.next;
      state.searchQuery = action.payload.searchQuery;
    
      const query = action.payload.searchQuery;
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory.push(query);
      }
    });
    builder.addCase(fetchJobs.rejected, (state, action) => {
      state.loading = false;
      state.entities.jobs = {};
      state.entities.skills = {};
      state.error = action.payload as string;
    });

    builder.addCase(fetchJobById.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchJobById.fulfilled, (state, action) => {
      state.loading = false;
      state.entities.jobs = {
        ...state.entities.jobs,
        ...action.payload.entities.jobs,
      };
      state.entities.skills = {
        ...state.entities.skills,
        ...action.payload.entities.skills,
      };
      state.error = null;
    });

    builder.addCase(fetchJobById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchSkillById.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchSkillById.fulfilled, (state, action) => {
      state.loading = false;
      state.entities.skills = {
        ...state.entities.skills,
        ...action.payload.entities.skills,
      };
      state.entities.jobs = {
        ...state.entities.jobs,
        ...action.payload.entities.jobs,
      };
      state.error = null;
    });

    builder.addCase(fetchSkillById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSearchQuery, clearHistory, setCursor } = jobsSlice.actions;

export default jobsSlice.reducer;
