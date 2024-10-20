import React, { useEffect, useRef, useState } from 'react';
import useModal from '@/hooks/useModal';
import NewFolder from '../modal/new_folder';
import SaveModal from '../modal/save_modal';
import devLog from '@/utils/devLog';
import { Folder, MoveArchiveRequestType } from '@/types/archive/archive';
import { deleteArchiveFolder, moveArchive } from '@/api/archive/archive';
import { useAtom, useAtomValue } from 'jotai';
import { selectedFolderAtom } from '@/atoms/folderAtoms';
import { selectedFolderLocationAtom } from '@/atoms/folderAtoms';
import { CallbackType } from '@/types/modal';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { userActionPrompt } from '@/constants/infoMessage';

interface MenuItemProps {
  label: string;
  folderData?: Folder;
  changeSidebarSelectedFolder?: (folder: Folder) => void;
  transferOpenStatus?: (isOpen: boolean) => void;
  transferReOrderFolder?: (folders: Folder[]) => void;
  isSelected?: boolean;
  Callback?: (type?: CallbackType) => void;
}

enum FolderAction {
  Edit = 'Edit Name',
  Move = 'Move',
  Delete = 'Delete',
}

const MenuItem = ({
  label,
  folderData,
  changeSidebarSelectedFolder,
  transferOpenStatus,
  transferReOrderFolder,
  isSelected,
  Callback,
}: MenuItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTop, setOpenTop] = useState<number>();
  const [isOption, setIsption] = useState(false);
  const optionMenuRef = useRef<HTMLElement>(null);
  const { inputModal, closeAlertModal, componentsModal, alertModal } = useModal();

  const [, setSidebarSelectedFolder] = useAtom(selectedFolderAtom);
  const selectedFolderLocation = useAtomValue(selectedFolderLocationAtom);

  const [isDragDisabled, setIsDragDisabled] = useState(false);

  const toggleSubMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (!folderData) return;
    changeSidebarSelectedFolder!(folderData);
  };

  const handleOptionClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    setIsption(true);
    const clickedElement = event.currentTarget as HTMLElement | null;
    if (clickedElement) {
      const top = clickedElement.getBoundingClientRect().top;
      setOpenTop(top + 16);
    }
  };

  const handleClickOutside = (e: any) => {
    if (optionMenuRef.current && !optionMenuRef.current.contains(e.target)) {
      setIsption(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    transferOpenStatus!(isOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // EDIT 클릭
  const editClick = () => {
    inputModal(<NewFolder folderData={folderData} title="이름 변경" Callback={editConfirm} />);
  };
  const editConfirm = () => {
    devLog('이름 변경 확인 버튼이 클릭되었습니다.');
    closeAlertModal();
    Callback!('edit');
  };

  // MOVE 클릭
  const moveClick = () => {
    componentsModal(
      <SaveModal
        title="폴더를 이동하시겠습니까?"
        titles="원하는 경로를 설정 후 저장해주세요."
        folderData={folderData}
        create={true}
        callbackType="move"
        Callback={handleSave}
      />,
    );
  };

  // DELETE 클릭
  const deleteClick = () => {
    alertModal(userActionPrompt.DELETE_ONE, deleteConfirm, true);
  };
  const deleteConfirm = async () => {
    const params = { id: folderData?.id as string };
    await deleteArchiveFolder(params);
    setSidebarSelectedFolder(null);
    await Callback!('delete');
  };

  // EDIT / MOVE / DELETE 핸들러
  const handleFolderAction = (action: FolderAction, e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    switch (action) {
      case FolderAction.Delete:
        deleteClick();
        break;
      case FolderAction.Edit:
        editClick();
        setSidebarSelectedFolder(folderData!);
        break;
      case FolderAction.Move:
        moveClick();
        setSidebarSelectedFolder(folderData!);
        break;
    }
  };

  const handleSave = async (type?: CallbackType) => {
    if (type && type === 'move') {
      const parsed_destination_folder = JSON.parse(localStorage.getItem('destination_folder') as string) as Folder;
      const destination_folder_id = parsed_destination_folder.id;

      // FolderModal에서 폴더 자기 자신으로 이동 선택하면 return
      if (folderData?.id === destination_folder_id) {
        Callback!('move');
        return;
      }

      const params: MoveArchiveRequestType = {
        folders: [folderData?.id as string],
        contents: [],
        move_id: destination_folder_id ?? selectedFolderLocation?.id,
      };
      await moveArchive(params);
      localStorage.removeItem('destination_folder');
    }

    await Callback!('move');
  };

  const onDragEnd = (result: DropResult) => {
    const subFolders = folderData?.sub_folder;
    if (!result.destination) return;
    if (!subFolders) return;
    const reorderedFolderList = Array.from(subFolders);
    const [removed] = reorderedFolderList.splice(result.source.index, 1);
    reorderedFolderList.splice(result.destination.index, 0, removed);

    transferReOrderFolder2(reorderedFolderList);
  };

  const transferReOrderFolder2 = (folders: Folder[]) => {
    transferReOrderFolder!(folders);
  };

  const transferOpenStatus2 = (isOpen: boolean) => {
    setIsDragDisabled(isOpen);
  };

  return (
    <>
      <div
        className={`${folderData?.sub_folder && folderData.sub_folder?.length > 0 ? 'depth' : ''} ${
          isOpen ? 'open' : ''
        }`}
        style={{ backgroundColor: isSelected ? 'rgba(3, 206, 121, 0.1)' : 'initial' }}
      >
        <span
          className="label"
          onClick={toggleSubMenu}
          // onClick={clickFolder}
        >
          {label}
        </span>
        <span className={`option ${isOption ? 'open' : ''}`} onClick={handleOptionClick}></span>

        {isOption && (
          <ul
            className="option_menu"
            style={{ top: isOpenTop }}
            ref={optionMenuRef as React.RefObject<HTMLUListElement>}
          >
            {Object.values(FolderAction).map((action) => (
              <li
                key={action}
                onClick={(e) => {
                  handleFolderAction(action, e);
                }}
              >
                {action}
              </li>
            ))}
          </ul>
        )}
      </div>

      {isOpen && folderData?.sub_folder && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`subfolder-${folderData.id}`} type="SUB_FOLDER">
            {(provided) => (
              <div className="depth_menu" ref={provided.innerRef} {...provided.droppableProps}>
                {folderData.sub_folder.map((folder, index) => (
                  <Draggable
                    key={folder.id}
                    draggableId={folder.id.toString()}
                    index={index}
                    isDragDisabled={isDragDisabled}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MenuItem
                          label={folder.name}
                          folderData={folder}
                          changeSidebarSelectedFolder={changeSidebarSelectedFolder}
                          transferOpenStatus={transferOpenStatus2}
                          transferReOrderFolder={transferReOrderFolder2}
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
      )}
    </>
  );
};

export default MenuItem;
