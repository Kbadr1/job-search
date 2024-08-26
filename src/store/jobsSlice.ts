import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { normalize, schema } from "normalizr"; 
import { CORE_API_URL } from "../constants";
import { REHYDRATE } from 'redux-persist'; 
import { RehydrateAction, RelationShipIds, TError, TJob, TJobResponseData, TJobsState } from "../types"; 

// Define the schemas for normalization
const skillSchema = new schema.Entity("skills");
const jobSchema = new schema.Entity("jobs", {
  skills: [skillSchema],
});
const jobListSchema = [jobSchema];

// Initial state with normalized structure
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

// Thunks
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const state = getState() as { jobs: TJobsState }; 
    const { cursor, searchQuery } = state.jobs;   
    const isNewSearch = cursor === 0;
    
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
          type: skill.attributes.type,
          importance: skill.attributes.importance,
          level: skill.attributes.level,
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

export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (jobId: string, thunkAPI) => {
    const { rejectWithValue, dispatch } = thunkAPI;
    try {
      // Fetch the job by ID
      const response = await axios.get(`${CORE_API_URL}/job/${jobId}`);
      const job = {
        id: response.data.data.job.id,
        title: response.data.data.job.attributes.title,
        skills: response.data.data.job.relationships.skills.map(
          (skill: RelationShipIds) => skill.id
        ),
      };

      const normalizedJobData = normalize(job, jobSchema);

      // Fetch related skills data
      const skillIds = job.skills;
      const skillsDataResponses = await Promise.all(skillIds.map(skillId =>
        dispatch(fetchSkillById(skillId)).unwrap()
      ));

      // Aggregate the related skills and jobs
      const relatedSkills = skillsDataResponses.reduce((acc, skillData) => {
        return {
          ...acc,
          ...skillData.entities.skills,
        };
      }, {});

      const relatedJobs = skillsDataResponses.reduce((acc, skillData) => {
        return {
          ...acc,
          ...skillData.entities.jobs,
        };
      }, {});

      return {
        entities: {
          jobs: {
            ...normalizedJobData.entities.jobs,
            ...relatedJobs,
          },
          skills: {
            ...normalizedJobData.entities.skills,
            ...relatedSkills,
          },
        },
      };
    } catch (error: TError | any) {
      return rejectWithValue(error?.message || 'Failed to fetch job');
    }
  }
);

export const fetchSkillById = createAsyncThunk(
  "skills/fetchSkillById",
  async (skillId: string, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      const response = await axios.get(`${CORE_API_URL}/skill/${skillId}`);
      const skill = {
        id: response.data.data.skill.id,
        name: response.data.data.skill.attributes.name,
        type: response.data.data.skill.attributes.type,
        importance: response.data.data.skill.attributes.importance,
        level: response.data.data.skill.attributes.level,
        jobs: response.data.data.skill.relationships.jobs.map(
          (job: RelationShipIds) => job.id
        ),
        skills: response.data.data.skill.relationships.skills.map(
          (relatedSkill: RelationShipIds) => relatedSkill.id
        ),
      };

      const normalizedSkillData = normalize(skill, skillSchema);
      return {
        entities: normalizedSkillData.entities,
      };
    } catch (error: TError | any) {
      return rejectWithValue(error?.message || 'Failed to fetch skill');
    }
  }
);

// Slice
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
