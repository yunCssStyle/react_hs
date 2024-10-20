import { FieldValues, UseFormReset } from 'react-hook-form';
import { CopyItem } from './copy';
import { HistoryItem } from './history';
import { PromptCategory } from './prompt';
import { FabricJson } from '@/components/studio/fabricCanvas';

interface CopyListItem {
  copyItem: CopyItem;
  openCopySave: (item: CopyItem) => void;
}
interface CopyListProps {
  items: CopyListItem[];
}

interface HistoryItemProps extends HistoryItem {}

interface RightProps {
  toggleRightPanel: () => void;
  openCopySave: (item: CopyItem) => void;
}

interface CurrentStudioInfo<T extends FieldValues> {
  studioId: string;
  filename: string;
  detail: string;
  copy: CopyItem | null;
  prompts: { id: string; type: PromptCategory; name: string }[];
  copyCount: number;
  imageId: string;
  resetFn: UseFormReset<T> | null;
  history: FabricJson[];
  copyPId: string;
  temperature: number;
  attribute: string;
  keywords: string[];
}

type PromptOption<T = string> = { label: string; value: T };

interface BannerForm {
  filename: string;
  detail: string;
  product: PromptOption;
  brand: PromptOption;
  fascinate: PromptOption;
  campaign: PromptOption;
}

export type { RightProps, HistoryItemProps, CopyListProps, CopyListItem, CurrentStudioInfo, PromptOption, BannerForm };
