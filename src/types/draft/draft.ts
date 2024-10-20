import { Prompt } from '../archive/archive';
import { CopyItem } from '../studio/copy';
import { PromptCategory } from '../studio/prompt';

/**
 * ! 드래프트 날짜
 */
export interface DraftDatesResponseType {
  drafts: string[];
}

/**
 * ! 드래프트 컨텐츠 아이템 + checked
 */
export interface DraftContentItem {
  draft_id: string;
  studio_id: string;
  copy_pid: string;
  checked?: boolean;
  img_url: string;
  title: string;
  detail: string;
  prompts: Prompt[];
  created_at: string;
  content_type: 'file' | 'copy';
}

/**
 * ! 드래프트 컨텐츠 응답값
 */
export interface DraftContentResponseType {
  page: number;
  page_count: number;
  total_rows: number;
  drafts: DraftContentItem[];
}

/**
 * ! 드래프트 삭제 요청 파라미터
 */
export interface DeleteDraftRequestType {
  ids: { studio_id: string; draft_id: string }[];
}

/**
 * ! 선택한 날짜 드래프트 목록 조회
 */

export interface SelectedDraftRequestType {
  page: number;
  page_count: number;
  date: string;
  sort: 'latest' | 'oldest' | 'name';
}

/**
 * ! 드래프트 상세 응답값
 */
export interface DraftDetailResponseType {
  draft_id: string;
  studio_id: string;
  img_url: string;
  org_img_url: string;
  org_img_id: string;
  created_at: string;
  filename: string;
  description: string;
  img_data: string;
  copy_id: string;
  copy_pid: string;
  copy_text: string;
  temperature: number;
  keywords: string[];
  attribute: string;
  //   prompts: PromptIdType[];
  prompts: { id: string; type: PromptCategory; name: string }[];
  copies: CopyItem[];
}
