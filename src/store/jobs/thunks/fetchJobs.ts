import { createAsyncThunk } from "@reduxjs/toolkit";
import { RelationShipIds, TError, TJob, TJobResponseData, TJobsState, TSkill } from "../../../types";
import { CORE_API_URL } from "../../../constants";
import { normalize, schema } from "normalizr";
import axios from "axios";

const skillSchema = new schema.Entity("skills");
const jobSchema = new schema.Entity("jobs", { skills: [skillSchema] });
const jobListSchema = [jobSchema];

export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as { jobs: TJobsState };
    const { cursor, searchQuery } = state.jobs;
    const isNewSearch = cursor === 0;

    try {
      const endpoint = searchQuery.trim().length >= 3
        ? `${CORE_API_URL}/jobs/search?query=${searchQuery.toLowerCase()}`
        : `${CORE_API_URL}/jobs?cursor=${cursor}&limit=12`;

      const { data } = await axios.get(endpoint);

      const jobs = data?.data?.jobs.map((job: TJobResponseData) => ({
        id: job.id,
        title: job.attributes.title,
        skills: job.relationships.skills.map(skill => skill.id),
      }));

      if (!jobs) {
        throw new Error("Jobs data is missing or undefined");
      }

      const normalizedData = normalize(jobs, jobListSchema);

      const allSkills = [...new Set(jobs.flatMap((job: TJob) => job.skills))];
      const skillsDataResponses = await Promise.all(
        allSkills.map(skillId => axios.get(`${CORE_API_URL}/skill/${skillId}`))
      );

      const skills = skillsDataResponses.reduce((acc: Record<string, TSkill>, { data }) => {
        const skill = data.data.skill;
        acc[skill.id] = {
          id: skill.id,
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
          skills: { ...normalizedData.entities.skills, ...skills },
        },
        result: normalizedData.result,
        count: data.data.meta.count,
        next: data.data.meta.next || null,
        searchQuery,
        isNewSearch,
      };
    } catch (error: TError | any) {
      return rejectWithValue(error?.message || "Failed to fetch jobs");
    }
  }
);
