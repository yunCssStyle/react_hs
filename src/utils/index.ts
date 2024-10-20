import { FabricJson } from '@/components/studio/fabricCanvas';
import { Folder } from '@/types/archive/archive';

/**
 * json을 formData로 변환
 */
export const jsonToFormData = <T extends object>(json: T) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(json)) {
    if (typeof value === 'string' || value instanceof Blob) {
      formData.append(key, value);
    }
  }

  return formData;
};

/**
 * base64로 된 이미지를 blob(file)으로 변환
 */
export const convertBase64ToBlob = (dataUrl: string): Blob => {
  const data: string = atob(dataUrl.split(',')[1]);
  const array: number[] = [];

  for (let i = 0; i < data.length; i++) {
    array.push(data.charCodeAt(i));
  }

  const blob: Blob = new Blob([new Uint8Array(array)], { type: 'image/jpg' });
  return new File([blob], 'image.jpg', { type: 'image/jpg', lastModified: Date.now() });
};

/**
 * 이미지를 base64로 변환
 */

export const convertImageToBase64 = async (imageUrl: string): Promise<string | null> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = () => {
      reject(new Error('이미지 변환 실패'));
    };
  });
};

/**
 * fabricjson으로 내보낸 json을 파일로 변환
 */
export const convertFabricJsonBlob = (object: FabricJson): Blob => {
  const jsonString = JSON.stringify(object);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return blob;
};

export const truncateString = (str: string) => {
  if (str.length > 25) {
    return str.substring(0, 25) + '...';
  }
  return str;
};

/**
 * 이미지의 유효성을 확인
 */
export const validateImage = (file: File): Promise<boolean> => {
  const message = '이미지 파일이 아닙니다.';
  return new Promise((resolve, reject) => {
    const type = file.type;

    if (!type.startsWith('image')) {
      reject(new Error(message));
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      const image = new Image();
      image.src = fileReader.result as string;

      image.onload = () => {
        resolve(true);
      };

      image.onerror = () => {
        reject(new Error(message));
      };
    };

    fileReader.onerror = () => {
      reject(new Error(message));
    };
  });
};

/** 모든 폴더들을 하나의 배열로 */
export const extractFolders = (folders: Folder[], result: Folder[] = []): Folder[] => {
  for (const folder of folders) {
    result.push(folder);
    if (folder.sub_folder.length > 0) {
      extractFolders(folder.sub_folder, result);
    }
  }
  return result;
};

/** 문자 자르기 */
export const sliceString = (value: string, cnt: number = 36) => {
  if (value.length >= cnt) {
    return value.slice(0, cnt) + '...';
  } else {
    return value;
  }
};
