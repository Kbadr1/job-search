import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { normalize, schema } from "normalizr"; 
import { CORE_API_URL } from "../../../constants";
import { RelationShipIds, TError } from "../../../types"; 
import { fetchSkillById } from "./fetchSkillById";

const jobSchema = new schema.Entity("jobs");

export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (jobId: string, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.get(`${CORE_API_URL}/job/${jobId}`);
      const jobData = data.data.job;

      const job = {
        id: jobData.id,
        title: jobData.attributes.title,
        skills: jobData.relationships.skills.map((skill: RelationShipIds) => skill.id),
      };

      const normalizedJobData = normalize(job, jobSchema);

      const skillsDataResponses = await Promise.all(
        job.skills.map((skillId: string) => dispatch(fetchSkillById(skillId)).unwrap())
      );

      const relatedSkills = skillsDataResponses.reduce(
        (acc, skillData) => ({ ...acc, ...skillData.entities.skills }),
        {}
      );

      const relatedJobs = skillsDataResponses.reduce(
        (acc, skillData) => ({ ...acc, ...skillData.entities.jobs }),
        {}
      );

      return {
        entities: {
          jobs: { ...normalizedJobData.entities.jobs, ...relatedJobs },
          skills: { ...normalizedJobData.entities.skills, ...relatedSkills },
        },
      };
    } catch (error: TError | any) {
      return rejectWithValue(error?.message || "Failed to fetch job");
    }
  }
);
