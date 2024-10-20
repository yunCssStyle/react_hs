export interface ApiResponse<T = any> {
  data: T;
  code: number;
  msg: string | null;
}
