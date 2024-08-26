import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { normalize, schema } from "normalizr"; 
import { CORE_API_URL } from "../../../constants";
import { RelationShipIds, TError } from "../../../types";

const skillSchema = new schema.Entity("skills");

export const fetchSkillById = createAsyncThunk(
  "skills/fetchSkillById",
  async (skillId: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${CORE_API_URL}/skill/${skillId}`);
      const skillData = data.data.skill;

      const skill = {
        id: skillData.id,
        name: skillData.attributes.name,
        type: skillData.attributes.type,
        importance: skillData.attributes.importance,
        level: skillData.attributes.level,
        jobs: skillData.relationships.jobs.map((job: RelationShipIds) => job.id),
        skills: skillData.relationships.skills.map((relatedSkill: RelationShipIds) => relatedSkill.id),
      };

      const normalizedSkillData = normalize(skill, skillSchema);
      return { entities: normalizedSkillData.entities };
    } catch (error: TError | any) {
      return rejectWithValue(error?.message || 'Failed to fetch skill');
    }
  }
);
