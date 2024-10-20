export enum infoMessage {
  COPY_SUCCESS = 'Copied',
  COPY_FAILED = 'Copy failed',
  TEMPERATURE_INFO = 'AI의 표현 자유도를 조절할 수 있으며, 숫자가 높을수록 자유로운 카피가 생성됩니다. (입력 범위: 0.7 ~ 1.7)',
  KEYWORD_INFO = '입력한 키워드를 반영한 카피가 생성됩니다.',
  USP_INFO = '생성할 카피의 소구점을 직접 입력하거나 수정할 수 있습니다.',
  CREATE_CHILD_FOLDER_SUCCESS = '해당 경로에 폴더가 생성되었습니다.',
  CREATE_FOLDER_SUCCESS = '폴더가 생성되었습니다.',
  DELETE_FOLDER_SUCCESS = '폴더가 삭제되었습니다.',
  EDIT_FOLDER_SUCCESS = '폴더 이름이 수정되었습니다.',
  SAVE_SUCCESS = '저장이 완료되었습니다.',
  SAVE_LIBRARY = '라이브러리 저장이 완료되었습니다.',
}

export enum userActionPrompt {
  IMPORT_STUDIO = '선택한 내용을 Studio로 불러오시겠습니까?',
  DELETE_HISTORY = '히스토리를 삭제할까요?',
  DELETE_ONE = '선택한 항목을 삭제 하시겠습니까?',
  RESET_STUDIO = '모든 작업을 초기화 하시겠습니까?',
}
