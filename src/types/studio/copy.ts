import { PromptCategory } from './prompt';

interface CopyItem {
  id: string;
  text: string;
}

interface GenerateCopyRequestType {
  studio_id: string;
  prompts: {
    id: string;
    type: PromptCategory;
    name: string;
  }[];
  temperature: number;
  keywords: string[];
  attribute: string;
}

interface GenerateCopyResponseType {
  refresh_count: number;
  copies: CopyItem[];
  copy_pid: string;
}

interface EvalCopyRequestType {
  studio_id: string;
  copies: { copy_id: string; evaluation: 1 | 2 }[]; // 1- good / 2 - bad
}

interface SaveCopyRequestType {
  id: string;
  text: string;
  folder_id: string;
  copy_pid: string;
  prompts: {
    type: PromptCategory;
    name: string;
    id: string;
  }[];
}

interface GetCopyListRequestType {
  copy_pid: string;
}

interface GetCopyListResponseType {
  copies: {
    id: string;
    text: string;
  };
}

export type {
  CopyItem,
  GenerateCopyRequestType,
  GenerateCopyResponseType,
  EvalCopyRequestType,
  SaveCopyRequestType,
  GetCopyListRequestType,
  GetCopyListResponseType,
};
