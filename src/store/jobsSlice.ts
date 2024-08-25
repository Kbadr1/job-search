import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { normalize, schema } from "normalizr"; 
import { CORE_API_URL } from "../constants";
import { REHYDRATE } from 'redux-persist'; 
import { RehydrateAction, RelationShipIds, TError, TJob,  TJobResponseData,TJobsState } from "../types"; 


const skillSchema = new schema.Entity("skills");
const jobSchema = new schema.Entity("jobs", {
  skills: [skillSchema],
});
const jobListSchema = [jobSchema];

const initialState: TJobsState = {
  jobs: {},
  skillsIds: [],
  skills: {},
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

      const normalizedData = normalize(jobs, jobListSchema);

      const allSkills = [...new Set(jobs.flatMap((job: TJob) => job.skills))]; 
      
      const skillsDataResponses = await Promise.all(allSkills.map(skillId =>
        axios.get(`${CORE_API_URL}/skill/${skillId}`)
      ));
      
      const skills = skillsDataResponses.reduce((acc: Record<string, any>, response) => {
        const skill = response.data.data.skill;
        
        const id = skill.id;
        acc[id] = {
          id,
          name: skill.attributes.name,
          jobs: skill.relationships.jobs.map((job: RelationShipIds) => job.id),
          skillsIds: skill.relationships.skills.map((skill: RelationShipIds) => skill.id),
        };
        return acc;
      }, {});

      return {
        jobs: normalizedData.entities.jobs,
        skillsIds: allSkills,
        skills,
        count: response.data.data.meta.count,
        next: response.data.data.meta.next || null,
        searchQuery,
        isNewSearch
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
      if (action.payload.isNewSearch) {
        // If it's a new search, override the existing jobs
        state.jobs = {...action.payload.jobs};
      } else {
        // Otherwise, merge the new jobs with the existing ones
        state.jobs = {
          ...state.jobs,
          ...action.payload.jobs,
        };
      }
      state.skillsIds = Array.from(new Set([...state.skillsIds, ...action.payload.skillsIds as string[]]));
      state.skills = {
        ...state.skills,
        ...action.payload.skills,
      };
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
      state.jobs = {};
      state.skillsIds = [];
      state.skills = {};
      state.error = action.payload as string;
    });
  },
});

export const { setSearchQuery, clearHistory, setCursor } = jobsSlice.actions;
 

export default jobsSlice.reducer;
