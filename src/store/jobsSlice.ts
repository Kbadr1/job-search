import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { normalize, schema } from "normalizr"; 
import { CORE_API_URL } from "../constants";
import { REHYDRATE } from 'redux-persist'; 
import { RehydrateAction, RelationShipIds, TError, TJob, TJobResponseData, TJobsState } from "../types"; 

const skillSchema = new schema.Entity("skills");
const jobSchema = new schema.Entity("jobs", {
  skills: [skillSchema],
});
const jobListSchema = [jobSchema];
 
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

export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const state = getState() as { jobs: TJobsState }; 
    const { cursor, searchQuery } = state.jobs;   
    const isNewSearch = cursor === 0;
    console.log(getState());
    
    try {
      const endpoint = searchQuery.trim().length >= 3
        ? `${CORE_API_URL}/jobs/search?query=${searchQuery.toLowerCase()}`
        : `${CORE_API_URL}/jobs?cursor=${cursor}&limit=12`;

      const response = await axios.get(endpoint);

      const jobs = response.data?.data?.jobs.map((job: TJobResponseData) => ({
        id: job.id,
        title: job.attributes.title,
        skills: job.relationships.skills.map(skill => skill.id),
      }));

      if (!jobs) {
        throw new Error('Jobs data is missing or undefined');
      }

      // Normalize the jobs data
      const normalizedData = normalize(jobs, jobListSchema);

      // Fetch skill data for all skills referenced in jobs
      const allSkills = [...new Set(jobs.flatMap((job: TJob) => job.skills))]; 
      const skillsDataResponses = await Promise.all(allSkills.map(skillId =>
        axios.get(`${CORE_API_URL}/skill/${skillId}`)
      ));

      // Normalize the skills data
      const skills = skillsDataResponses.reduce((acc: Record<string, any>, response) => {
        const skill = response.data.data.skill;
        const id = skill.id;
        acc[id] = {
          id,
          name: skill.attributes.name,
          jobs: skill.relationships.jobs.map((job: RelationShipIds) => job.id),
        };
        return acc;
      }, {});

      return {
        entities: {
          jobs: normalizedData.entities.jobs,
          skills: {
            ...normalizedData.entities.skills,
            ...skills,
          },
        },
        result: normalizedData.result,
        count: response.data.data.meta.count,
        next: response.data.data.meta.next || null,
        searchQuery,
        isNewSearch,
      };
    } catch (error: TError | any) {
      return rejectWithValue(error?.message || 'Failed to fetch jobs');
    }
  }
);

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
    
      // Update search history
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
  },
});

export const { setSearchQuery, clearHistory, setCursor } = jobsSlice.actions;

export default jobsSlice.reducer;
