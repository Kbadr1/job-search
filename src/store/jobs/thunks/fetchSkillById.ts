import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { normalize, schema } from "normalizr"; 
import { CORE_API_URL } from "../../../constants";
import { RelationShipIds, TError } from "../../../types";

const skillSchema = new schema.Entity("skills");

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
