import MenuItem from '../layouts/MenuItem';
import useModal from '@/hooks/useModal';
import NewFolder from '../modal/new_folder';
import { Folder } from '@/types/archive/archive';
import { CallbackType } from '@/types/modal';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { useState } from 'react';
import { foldersWithStorageAtom } from '@/atoms/folderAtoms';
import { useAtom } from 'jotai';

interface LibraryMenuProps {
  changeSidebarSelectedFolder?: (folder: Folder) => void;
  handleFolderOrder?: (folders: Folder[]) => void;
  Callback: (type?: CallbackType) => void;
}

const LibraryMenu: React.FC<LibraryMenuProps> = ({ changeSidebarSelectedFolder, handleFolderOrder, Callback }) => {
  const { inputModal } = useModal();
  const [isDragDisabled, setIsDragDisabled] = useState(false);
  const [folderListAtom, sefFolderListAtom] = useAtom(foldersWithStorageAtom);

  // 새로운 폴더 생성
  const newClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    inputModal(<NewFolder title="새로운 폴더" callbackType="folder" Callback={() => Callback('add')} />);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (folderListAtom === null) return;

    const reorderedFolderList = Array.from(folderListAtom);
    const [removed] = reorderedFolderList.splice(result.source.index, 1);
    reorderedFolderList.splice(result.destination.index, 0, removed);
    sefFolderListAtom(reorderedFolderList);
    transferReOrderFolder(reorderedFolderList);
  };

  const transferReOrderFolder = (folder: Folder[]) => {
    handleFolderOrder!(folder);
  };

  const transferOpenStatus = (isOpen: boolean) => {
    setIsDragDisabled(isOpen);
  };

  return (
    <>
      <div className="create_folder" onClick={newClick}>
        Create Folder
      </div>
      <div className="menu">
        <p>Folders</p>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="parentFolder" type="PARENT_FOLDER">
            {(provided) => (
              <div className="menus" {...provided.droppableProps} ref={provided.innerRef}>
                {folderListAtom &&
                  folderListAtom.map((folder, index) => (
                    <Draggable
                      key={folder.id}
                      draggableId={folder.id.toString()}
                      index={index}
                      isDragDisabled={isDragDisabled}
                    >
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <MenuItem
                            label={folder.name}
                            folderData={folder}
                            changeSidebarSelectedFolder={changeSidebarSelectedFolder}
                            transferOpenStatus={transferOpenStatus}
                            transferReOrderFolder={transferReOrderFolder}
                            isSelected={
                              folder.id === (JSON.parse(localStorage.getItem('selectedFolder') as string) as Folder)?.id
                            }
                            Callback={Callback}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  );
};

export default LibraryMenu;
