import { createAsyncThunk } from "@reduxjs/toolkit";
import { RelationShipIds, TError, TJob, TJobResponseData, TJobsState, TSkill } from "../../../types";
import { CORE_API_URL } from "../../../constants";
import { normalize, schema } from "normalizr";
import axios from "axios";

const skillSchema = new schema.Entity("skills");
const jobSchema = new schema.Entity("jobs", {
  skills: [skillSchema],
});
const jobListSchema = [jobSchema];

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
      const skills = skillsDataResponses.reduce((acc: Record<string, TSkill>, response) => {
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