import { ContentItem } from '../archive/archive';

interface MenuItemProps {
  label: string;
  children?: React.ReactNode;
}
interface Item {
  img?: string;
  text?: string;
  title: string;
  dataTime: string;
  type: string;
  tags?: string[];
}

interface ListProps {
  checkContent?: (item: ContentItem) => void;
  selectFolderOnList?: (folderID: string) => void;
  loadMore?: () => void;
  Callback?: () => void;
}

interface CommonPaginationResponseType {
  page: number;
  page_count: number;
  total_rows: number;
}

/**
 * @type P: 제품
 * @type B: 브랜드
 * @type F: 관심사
 * @type C: 캠페인 목표
 * @type M: 매체
 * @type A: 매체 지연
 */
type PromptType = 'P' | 'B' | 'F' | 'C' | 'M' | 'A';

type OrderFilterType = 'latest' | 'oldest' | 'name';

type ContentFilterType = 'File' | 'Folder' | 'Copy';

export type {
  MenuItemProps,
  ListProps,
  Item,
  CommonPaginationResponseType,
  PromptType,
  OrderFilterType,
  ContentFilterType,
};
