import { Action } from "@reduxjs/toolkit"; 

export interface TJob { 
  id: string;
  title: string;
  skills: string[];
}

export interface TSkill {
  id: string;
  name: string;
  type: string;
  importance: string;
  level: string;
  jobs: string[];
  skills: string[];
}

export interface TJobsState {
  entities: {
    jobs: Record<string, TJob>;
    skills: Record<string, TSkill>;
  };
  loading: boolean;
  error: string | null;
  count: number;
  next: number;
  searchQuery: string;
  searchHistory: string[]; 
  cursor: number; 
}

export interface TError {
  message?: string;
}

export interface THydrate {
  jobs: TJobsState;
}
 
export interface RehydrateAction extends Action<"persist/REHYDRATE"> {
  payload: THydrate;
}

export interface TJobResponseData {
  id: string;
  attributes: {
    title: string; 
  }
  relationships: {
    skills: { id: string }[];
  };
}

export interface RelationShipIds {
  id: string;
}
