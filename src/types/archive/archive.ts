import { CommonPaginationResponseType, ContentFilterType, PromptType } from '../common';
import { CopyItem } from '../studio/copy';
import { PromptCategory } from '../studio/prompt';

// # 공통 ===================================
/**
 * ! 최신 / 오래된 순서
 */
export type SortType = 'latest' | 'oldest';

/**
 *  ! 아카이브 pagination 있는 요청 타입
 */
export type ArchiveCommonRequestType = {
  page?: number;
  page_count?: number;
  sort?: SortType;
  filterDept?: string;
};

/**
 * ! id없는 프롬프트 타입
 */
export interface Prompt {
  type: PromptType;
  name: string;
}

/**
 * ! id있는 프롬프트 타입
 */
export interface PromptIdType extends Prompt {
  id: string;
}

// # 배너 ===================================

/**
 * ! 배너타입
 */
export interface BannerType {
  id: string;
  img_url: string;
  created_at: string;
  filename: string;
  description: string;
  prompts: Prompt[];
}

/**
 * ! 배너 리스트 응답 타입
 */
export interface BannerListResponseType extends CommonPaginationResponseType {
  banners: BannerType[];
}
/**
 * ! 배너 상세 응답 타입
 */
export interface BannerDetailResponseType {
  id: string;
  img_url: string;
  org_img_url: string;
  created_at: string;
  filename: string;
  description: string;
  copies: CopyItem[];
  copy_id: string;
  copy_text: string;
  studio_id: string;
  org_img_id: string;
  img_data: string;
  copy_pid: string;
  prompts: { id: string; type: PromptCategory; name: string }[];
  temperature: number;
  attribute: string;
  keywords: string[];
}

/**
 * ! 배너 생성 요청 타입
 */
export interface CreateBannerRequestType {
  id: string;
  folder_id: string;
  detail: string;
  banner_copy_id: string;
  create_copy_count: number;
  filename: string;
  origin_img_url: string;
  image_data: string;
  image_url: string;
  propmts: PromptIdType;
}

// # 카피 ===================================
/**
 * ! 카피 타입
 */
export interface CopyType {
  id: string;
  text: string;
  created_at: string;
  prompts: Prompt[];
}

/**
 * ! 카피리스트 응답 타입
 */
export interface CopyListResponseType extends CommonPaginationResponseType {
  copies: CopyType[];
}

/**
 * ! 카피 생성 요청 타입
 */
export interface CreateCopyRequestType extends CopyType {
  folder_id: string;
  prompts: PromptIdType[];
}

// # 컨텐츠 =================================
/**
 * ! 아카이브 켄텐츠 아이템 타입
 */
export interface ContentItem {
  id: string;
  checked?: boolean;
  img_url: string;
  title: string;
  detail: string;
  prompts: Prompt[];
  created_at: string;
  content_type: 'file' | 'folder' | 'copy';
}

/**
 * ! 아카이브 컨텐츠 생성 타입
 */
export interface CreateArchiveContentRequestType {
  studio_id: string;
  folder_id: string;
  copy_id: string;
  detail: string;
  content_type: string;
  create_copy_count: number;
  filename: string;
  origin_img_url: string;
  json_data: string;
  img_url: string;
  prompts: {
    name: string;
    type: PromptCategory;
    id: string;
  }[];
}

/**
 * ! 아카이브 컨텐츠 목록 조회 요청 타입
 */
export interface ArchiveContentRequestType {
  page: number;
  page_count: number;
  folder_id: string;
  filter?: ContentFilterType[];
  sort: 'latest' | 'oldest' | 'name';
}

/**
 * ! 아카이브 컨텐츠 목록 조회 응답 타입
 */
export interface ArchiveContentResponseType {
  page: number;
  page_count: number;
  total_rows: number;
  contents: ContentItem[];
}

// # 폴더 ================================
/**
 * ! 폴더 타입
 */
export interface Folder {
  id: string;
  name: string;
  parent_id: string;
  depth: number;
  created_at: string;
  create_id: number;
  sub_folder: Folder[];
}

/**
 * ! 아카이브 폴더 생성 요청 타입
 */
export interface CreateFolderRequestType {
  folder_name: string;
  parent_id?: string | undefined;
}

export interface CreateFolderResponseType extends Omit<Folder, 'name'> {
  folder_name: string;
}

/**
 * ! 아카이브 폴더 목록 조회 응답 타입
 */
// export interface FolderListResponseType {}

export type FolderListResponseType = Folder[];

/**
 * ! 아카이브 폴더명 변경 요청 타입
 */
export interface ChangeFolderNameRequestType {
  id: string;
  name: string;
}

/**
 * ! 아카이브 이동 요청 타입
 */
export interface MoveArchiveRequestType {
  move_id?: string | undefined;
  folders: string[];
  contents: string[];
}

// # Draft ================================

export interface CreateDraftRequestType {
  studio_id: string;
  copy_pid: string;
  detail?: string;
  create_copy_count: number;
  filename: string;
  origin_img_url: string;
  origin_img_id: string;
  json_data: string;
  img_url: string;
  prompts: { type: PromptCategory; name: string; id: string }[];
}
