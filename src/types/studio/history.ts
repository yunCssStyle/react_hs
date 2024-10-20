import { PromptItem } from '@/types/studio/prompt';

interface HistoryItem {
  id: string;
  created_at: string;
  filename: string;
  image_url: string;
  image_data: string;
  prompts: Omit<PromptItem, 'item_id'>[];
  org_image_url: string;
  copy_text: string;
  copy_id: string;
  copy_pid: string;
}

interface GetHistoryRequestType {
  studio_id: string;
  page?: number;
  page_count?: number;
  sort?: 'latest' | 'oldest';
}

interface GetHistoryResponseType {
  page: number;
  page_count: number;
  total_rows: number;
  histories: HistoryItem[];
}

interface DeleteHistoryRequestType {
  studio_id: string;
  history_id: string;
}

export type { HistoryItem, GetHistoryRequestType, GetHistoryResponseType, DeleteHistoryRequestType };
