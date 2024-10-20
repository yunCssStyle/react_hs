import { PromptCategory } from '@/types/studio/prompt';

interface CreateBannerRequestType {
  image_id?: string;
  prompts: { id: string; type: PromptCategory; name: string }[];
}

interface CreateBnnerResponseType {
  studio_id: string;
}

interface UploadBannerImageRequestType {
  file: File;
  stuiod_id?: string | ''; // 스튜디오 아이디가 없는 경우 공백
}

interface UploadBannerImageResponseType {
  image_id: string;
  image_url: string;
}

interface SaveBannerRequestType {
  studio_id: string;
  folder_id: string;
  image_id: string;
  image_data: string; // JSON
  filename: string;
  detail: string;
  copy_id: string;
  copy_pid: string;
  file: Blob | File;
}

export type {
  CreateBannerRequestType,
  CreateBnnerResponseType,
  UploadBannerImageRequestType,
  UploadBannerImageResponseType,
  SaveBannerRequestType,
};
