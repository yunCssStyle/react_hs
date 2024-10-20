export enum ValidationErrors {
  REQUIRED_FILENAME = '제목이 입력되지 않았습니다.',
  REQUIRED_DETAIL = '설명이 입력되지 않았습니다.',
  REQUIRED_PRODUCT = '제품이 선택되지 않았습니다.',
  REQUIRED_BRAND = '브랜드가 선택되지 않았습니다.',
  REQUIRED_FASCINATE = '관심사가 선택되지 않았습니다.',
  REQUIRED_CAMPAIGN = '캠페인 목표가 선택되지 않았습니다.',
  REQUIRED_IMAGE = '이미지를 업로드해주세요.',
  REQUIRED_ID = 'ID를 입력하세요.',
  REQUIRED_PASSWORD = '비밀번호를 입력하세요.',
  REQUIRED_STUDIO_ID = '배너가 생성되지 않았습니다.',
  REQUIRED_FOLDER_ID = '폴더가 선택되지 않았습니다.',
  REQUIRED_PROMPTS = '프롬프트가 없습니다',
  REQUIRED_DATA_URL = '캔버스 변환에 실패했습니다',
  REQUIRED_FABRIC_JSON = '캔버스가 초기화되지 않았습니다',
  REQUIRED_COPY_ID = '카피가 생성되지 않았습니다',
  REQUIRED_UNKNOWN = '필수값이 없습니다',
}

export enum CommonErrors {
  EXPIRED_TOKEN = '세션이 만료되었습니다.',
}
