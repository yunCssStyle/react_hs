import List from '@/components/layouts/List';
import Sorting from '@/components/layouts/Sorting';
import LibraryMenu from '@/components/library/library_menu';
import SaveModal from '@/components/modal/save_modal';
import useModal from '@/hooks/useModal';
import { ArchiveContentRequestType, ContentItem, Folder, MoveArchiveRequestType } from '@/types/archive/archive';
import devLog from '@/utils/devLog';
import { MacScrollbar } from 'mac-scrollbar';
import { useEffect, useState } from 'react';
import {
  deleteArchiveContent,
  deleteArchiveFolder,
  getArchiveContentList,
  getArchiveFolderList,
  moveArchive,
  setFolderOrder,
} from '@/api/archive/archive';
import { useAtom } from 'jotai';
import {
  contentAndFolder,
  foldersWithStorageAtom,
  selectedFolderAtom,
  selectedFolderLocationAtom,
  untitledFolderCount,
} from '@/atoms/folderAtoms';
import { ContentFilterType, OrderFilterType } from '@/types/common';
import { CallbackType } from '@/types/modal';
import { sliceString } from '@/utils';
import { infoMessage, userActionPrompt } from '@/constants/infoMessage';

const Library = () => {
  const { componentsModal, alertModal, closeAlertModal, closeModal } = useModal();

  // 페이지네이션
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // 전체 선택
  const [allChecked, setAllChecked] = useState(false);

  // 사이드바 폴더
  const [folderListAtom, setFolderListAtom] = useAtom(foldersWithStorageAtom);
  const [sidebarSelectedFolder, setSidebarSelectedFolder] = useAtom(selectedFolderAtom);
  const [, setDestinationFolder] = useAtom(selectedFolderLocationAtom);

  // 컨텐츠 리스트
  const [contentList, setContentList] = useAtom(contentAndFolder);
  const [contentFilter, setContentFilter] = useState<ContentFilterType[] | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderFilterType>('latest');

  const [checkedContentList, setCheckedContentList] = useState<ContentItem[] | null>(null);
  const [checkedFolderList, setCheckedFolderList] = useState<ContentItem[] | null>(null);

  const [, setUntitledFolderCount] = useAtom(untitledFolderCount);

  // MOUNTED
  useEffect(() => {
    bindFolder();

    return () => {
      setContentList(null);
      setFolderListAtom(null);
      // setSidebarSelectedFolder(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lastPage && page < lastPage) {
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  }, [page, lastPage, hasMore]);

  // 하단 MOVE 버튼
  const moveClick = () => {
    if (isNothingChecked()) return;

    componentsModal(
      <SaveModal
        title="폴더를 이동하시겠습니까?"
        titles="원하는 경로를 설정 후 저장해주세요."
        create={false}
        Callback={moveConfirm}
      />,
    );
  };
  // 이동 확인 버튼 클릭
  const moveConfirm = async () => {
    if (isNothingChecked()) return;
    let selectedContentIDs: string[] = [];
    let selectedFolderIDs: string[] = [];

    if (checkedContentList && checkedContentList.length > 0) {
      selectedContentIDs = checkedContentList?.map((content) => content.id) as string[];
    }
    if (checkedFolderList && checkedFolderList.length > 0) {
      selectedFolderIDs = checkedFolderList?.map((folder) => folder.id) as string[];
    }

    const parsed_destination_folder = JSON.parse(localStorage.getItem('destination_folder') as string) as Folder;

    // 폴더 자기 자신으로 이동하면 리턴
    const isSameFolder = selectedFolderIDs.some((id) => {
      if (id === parsed_destination_folder.id) {
        return true;
      }
      return false;
    });

    if (isSameFolder) {
      await bindFolder();
      return;
    }

    const params: MoveArchiveRequestType = {
      ...(parsed_destination_folder.id ? { move_id: parsed_destination_folder.id } : {}),
      folders: selectedFolderIDs,
      contents: selectedContentIDs,
    };
    await moveArchive(params);

    if (parsed_destination_folder.depth === 1) {
      alertModal('파일 이동이 완료되었습니다.');
    } else {
      alertModal(
        <p>
          <span className="point">“{sliceString(parsed_destination_folder.name)}”</span>
          <br /> 경로로 파일이 이동이 완료되었습니다.
        </p>,
      );
    }

    await bindFolder();
  };

  const isNothingChecked = () => {
    const IS_FOLDER_CHECKED = checkedFolderList ? checkedFolderList.length > 0 : false;
    const IS_CONTENT_CHECKED = checkedContentList ? checkedContentList.length > 0 : false;
    return !IS_CONTENT_CHECKED && !IS_FOLDER_CHECKED;
  };

  // 삭제 클릭
  const deleteClick = () => {
    if (isNothingChecked()) return;

    alertModal(userActionPrompt.DELETE_ONE, deleteConfirm, true);
  };

  // 삭제 확인 버튼 클릭
  const deleteConfirm = async () => {
    if (isNothingChecked()) return;

    const taskGroup = [];

    if (checkedContentList && checkedContentList.length > 0) {
      const checkedContentIDs = checkedContentList?.map((content) => content.id);
      const params: { ids: string[] } = { ids: checkedContentIDs as string[] };
      await deleteArchiveContent(params);
      taskGroup.push(deleteArchiveContent(params));
    }
    if (checkedFolderList && checkedFolderList.length > 0) {
      const checkedFolderIDs = checkedFolderList?.map((folder) => folder.id) as string[];
      const folderDeleteTask = checkedFolderIDs.map((id) => {
        const params = { id };
        return deleteArchiveFolder(params);
      });
      taskGroup.push(...folderDeleteTask);
    }

    await Promise.all(taskGroup);

    await bindFolder();
    devLog('삭제 확인 버튼이 클릭되었습니다.');
  };

  // 사이드바 폴더 가져오기
  const fetchFolders = async (): Promise<Folder[]> => {
    const data = await getArchiveFolderList();
    return data.data || [];
  };

  // Untitled Folder 폴더명 가진 폴더 개수 세팅
  const handleUntitledFolderCount = (folders: Folder[]) => {
    let count = 0;

    const recurse = (folderArray: Folder[]) => {
      for (const folder of folderArray) {
        if (folder.name.includes('Untitled Folder')) {
          count += 1;
        }
        if (folder.sub_folder.length > 0) {
          recurse(folder.sub_folder);
        }
      }
    };

    recurse(folders);

    setUntitledFolderCount(count);
  };

  const findSameFolder = (folders: Folder[]): boolean => {
    let hasSameFoler = false;
    const localStorageFolder = JSON.parse(localStorage.getItem('selectedFolder') as string) as Folder | null;

    const recurse = (folderArray: Folder[]) => {
      for (const folder of folderArray) {
        if (folder.id === localStorageFolder?.id) {
          hasSameFoler = true;
        }
        if (folder.sub_folder.length > 0) {
          recurse(folder.sub_folder);
        }
      }
    };
    recurse(folders);

    return hasSameFoler;
  };

  // 🚀 폴더 바인딩
  const bindFolder = async () => {
    const fetchedFolders = await fetchFolders();
    setFolderListAtom(fetchedFolders);
    const localStorageFolder = JSON.parse(localStorage.getItem('selectedFolder') as string) as Folder | null;

    if (findSameFolder(fetchedFolders) === true) {
      setSidebarSelectedFolder(localStorageFolder);
    } else if (folderListAtom) {
      // setSidebarSelectedFolder(folderListAtom[0]);
      setSidebarSelectedFolder(null);
      handleUntitledFolderCount(folderListAtom);
    }
    setDestinationFolder(null);
    // handleUntitledFolderCount(fetchedFolders);
  };
  // 폴더 생성/수정 모달에서 폴더 추가 시 호출 로직
  const onSuccessUpdateFolder = (type?: CallbackType) => {
    devLog('🌈🌈🌈🌈 콜백타입 : ', type && type);
    closeAlertModal();
    closeModal();
    bindFolder();
    const selectedFolder = JSON.parse(localStorage.getItem('selectedFolder') as string) as Folder | null;

    if (type === 'delete') alertModal(`${infoMessage.DELETE_FOLDER_SUCCESS}`);
    else if (type === 'edit') alertModal(`${infoMessage.EDIT_FOLDER_SUCCESS}`);
    else if (selectedFolder && type === 'add')
      alertModal(
        <p>
          <span className="point">“{sliceString(selectedFolder?.name)}”</span>
          <br />
          {infoMessage.CREATE_CHILD_FOLDER_SUCCESS}
        </p>,
      );
    else alertModal(`${infoMessage.CREATE_FOLDER_SUCCESS}`);
  };

  useEffect(() => {
    setPage(1);
    setContentList([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarSelectedFolder, orderFilter, contentFilter]);

  // 컨텐츠 리스트 호출
  useEffect(() => {
    setIsLoading(true);
    if (sidebarSelectedFolder === null) return;
    // devLog('🔵 사이드바 선택된 폴더 : ', sidebarSelectedFolder?.name);

    const params: ArchiveContentRequestType = {
      page: page,
      page_count: 10,
      folder_id: sidebarSelectedFolder?.id as string,
      ...(contentFilter ? { filter: contentFilter.map((filter) => filter.toLowerCase()) as ContentFilterType[] } : {}),
      sort: orderFilter,
    };

    getArchiveContentList(params).then((res) => {
      const addedCheckDataContents = res.data.contents.map((content) => ({ ...content, checked: false }));
      const LAST_PAGE = Math.ceil(res.data.total_rows / res.data.page_count);

      setLastPage(LAST_PAGE);

      setContentList((prev) => {
        if (prev && page !== 1) {
          return [...prev, ...addedCheckDataContents];
        }
        return addedCheckDataContents;
      });

      setIsLoading(false);
    });

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, contentFilter, orderFilter, sidebarSelectedFolder]);

  const loadMore = () => {
    if (isLoading === false) {
      setPage((prev) => (prev += 1));
    }
  };

  // 순서 필터 변경
  const changeOrderFilter = (value?: OrderFilterType) => {
    if (!value) return;
    setOrderFilter(value);
  };

  // 폴더 전체 선택 체크박스 이벤트
  const selectAllContents = () => {
    setAllChecked(!allChecked);
    setContentList((prev) => {
      if (prev === null) return null;

      return prev.map((content) => ({
        ...content,
        checked: !allChecked,
      }));
    });
  };

  // contentList에서 폴더 | 컨텐츠 분리
  useEffect(() => {
    const folders: ContentItem[] = [];
    const contents: ContentItem[] = [];

    contentList?.forEach((content) => {
      if (content.checked !== true) return;
      switch (content.content_type) {
        case 'folder':
          folders.push(content);
          break;
        default:
          contents.push(content);
          break;
      }
      setCheckedFolderList(folders);
      setCheckedContentList(contents);
    });
  }, [contentList]);

  useEffect(() => {
    if (contentList === null || contentList.length === 0) {
      setAllChecked(false);
    } else {
      setAllChecked(contentList.every((content) => content.checked));
    }
  }, [contentList]);

  useEffect(() => {
    if (allChecked) return;
    setCheckedFolderList([]);
    setCheckedContentList([]);
  }, [allChecked]);

  // 개별 컨텐츠 선택 체크박스 이벤트
  const checkContent = (folder: ContentItem) => {
    setContentList((prev) => {
      if (prev === null) return null;

      return prev?.map((content) => {
        if (content === folder) {
          return { ...content, checked: !content.checked };
        }
        return content;
      });
    });
  };

  // 리스트에서 폴더 클릭
  const selectFolderOnList = (folderID: string) => {
    const findFolder = (folders: Folder[]): Folder | null => {
      for (const folder of folders) {
        if (folder.id === folderID) {
          return folder;
        }

        if (folder.sub_folder.length > 0) {
          const found = findFolder(folder.sub_folder);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedFolder = findFolder(folderListAtom as Folder[]);
    if (selectedFolder) {
      setSidebarSelectedFolder(selectedFolder);
    }
  };

  // 폴더 순서
  const handleFolderOrder = async (folders?: Folder[]) => {
    if (folders) {
      const orderedFolders = folders.map((folder, index) => ({ id: folder.id, order: index + 1 }));
      const params = { folders: orderedFolders };
      await setFolderOrder(params);
    }
    await bindFolder();
  };

  const clickSidebarBackground = () => {
    setSidebarSelectedFolder(null);
  };

  return (
    <div className="sub_cont">
      <MacScrollbar className="left_menu sub_left" onClick={clickSidebarBackground}>
        {/* 사이드 바 */}
        <LibraryMenu
          changeSidebarSelectedFolder={setSidebarSelectedFolder}
          handleFolderOrder={handleFolderOrder}
          Callback={onSuccessUpdateFolder}
        />
      </MacScrollbar>
      <div className="sub_container">
        <div className="sub_main">
          {/* 필터 */}
          <Sorting
            changeOrderFilter={changeOrderFilter}
            contentFilter={contentFilter}
            setContentFilter={setContentFilter}
          />
          <div className="cont_list">
            <div className="list_head">
              <div className="check">
                <input type="checkbox" id="File" checked={allChecked} onChange={selectAllContents} />
              </div>
              <div className="name">이름</div>
              <div className="savedate">저장일</div>
              <div className="type">종류</div>
            </div>
            {/* 켄텐츠 + 폴더 리스트 */}
            <List
              checkContent={checkContent}
              selectFolderOnList={selectFolderOnList}
              loadMore={loadMore}
              Callback={onSuccessUpdateFolder}
            />
          </div>
        </div>
        <div className="sub_btn">
          <button className="delete" onClick={deleteClick}>
            Delete
          </button>
          <button className="move" onClick={moveClick}>
            Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default Library;
