import { Folder } from '../archive/archive';

/**
 * @description SaveModal Save버튼 동작 타입
 */
type CallbackType = 'folder' | 'move' | 'studioSave' | 'delete' | 'edit' | 'add';

interface SaveModalProps {
  title: string;
  titles: string;
  folders?: Folder[];
  folderData?: Folder;
  create: boolean;
  callbackType?: CallbackType;
  Callback?: (type?: CallbackType) => void;
}

type NewFolderProps = {
  title: string;
  folderData?: Folder;
  folderID?: string;
  name?: string;
  selectedFolderToCreate?: Folder;
  callbackType?: CallbackType;
  Callback: (type?: CallbackType) => void;
};

interface LocationBoxProps {
  isFolder: boolean;
  selectedFolderForMove?: Folder;
  Callback?: (type?: CallbackType) => void;
}
export type { SaveModalProps, NewFolderProps, LocationBoxProps, CallbackType };
