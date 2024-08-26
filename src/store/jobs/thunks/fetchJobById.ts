import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { normalize, schema } from "normalizr"; 
import { CORE_API_URL } from "../../../constants";
import { RelationShipIds, TError } from "../../../types"; 
import { fetchSkillById } from "./fetchSkillById";

const jobSchema = new schema.Entity("jobs");

export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (jobId: string, thunkAPI) => {
    const { rejectWithValue, dispatch } = thunkAPI;
    try {
      const response = await axios.get(`${CORE_API_URL}/job/${jobId}`);
      const job = {
        id: response.data.data.job.id,
        title: response.data.data.job.attributes.title,
        skills: response.data.data.job.relationships.skills.map(
          (skill: RelationShipIds) => skill.id
        ),
      };

      const normalizedJobData = normalize(job, jobSchema);

      const skillIds = job.skills;
      const skillsDataResponses = await Promise.all(skillIds.map((skillId: string) =>
        dispatch(fetchSkillById(skillId)).unwrap()
      ));

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
