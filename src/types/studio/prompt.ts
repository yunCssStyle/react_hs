export enum PromptCategory {
  전체 = 'all',
  제품 = 'P',
  브랜드 = 'B',
  관심사 = 'F',
  캠페인목표 = 'C',
  매체 = 'M',
  매체지면 = 'A',
}

interface GetPromptListRequestType {
  type: PromptCategory;
  product_id: string;
}

interface PromptItem {
  item_id: string;
  type: PromptCategory;
  name: string;
}

interface ProductItem {
  product_id: string;
  name: string;
  items: PromptItem[];
}

interface GetPromtpListResponseType {
  products: ProductItem[];
}

/**
 * Brand, Attribute는 하단 GetAttributeResponseType 에만 사용되는 타입
 */
export interface AttributeList {
  product_id: string;
  brands: Brand[];
}

export interface Brand {
  brand_id: string;
  attributes: AttributeItem[];
}

interface AttributeItem {
  item_id: string;
  attribute: string;
}

interface GetAttributeResponseType {
  list: AttributeList[];
}

export type {
  GetPromptListRequestType,
  GetPromtpListResponseType,
  PromptItem,
  ProductItem,
  GetAttributeResponseType,
  AttributeItem,
};
