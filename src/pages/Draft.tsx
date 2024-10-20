import { deleteDraft, getDraftDateList, getSelectedDateContentList } from '@/api/draft/draft';
import { draftDatesWithStorageAtom, selectedDateContentItem } from '@/atoms/draftAtoms';
import DraftList from '@/components/draft/draft_list';
import DraftMenu from '@/components/draft/draft_menu';
import Sorting from '@/components/layouts/Sorting';
import useModal from '@/hooks/useModal';
import { ContentFilterType, OrderFilterType } from '@/types/common';
import { DeleteDraftRequestType, DraftContentItem, SelectedDraftRequestType } from '@/types/draft/draft';
import { useAtom, useSetAtom } from 'jotai';
import { MacScrollbar } from 'mac-scrollbar';
import { useCallback, useEffect, useState } from 'react';

const Draft = () => {
  const setDraftDateList = useSetAtom(draftDatesWithStorageAtom);
  const { alertModal } = useModal();
  // 첫 렌더링
  const [isFirstRender, setIsFirstRender] = useState(true);
  // 페이지네이션
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  // 필터
  const [contentFilter, setContentFilter] = useState<ContentFilterType[] | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderFilterType>('latest');
  // 전체 선택
  const [allChecked, setAllChecked] = useState(false);
  // 선택한 날짜 데이터 리스트
  const [contentList, setContentList] = useAtom(selectedDateContentItem);
  // 선택한 날짜
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // 선택한 컨텐츠 리스트
  const [checkedContentList, setCheckedContentList] = useState<DraftContentItem[] | null>(null);

  // ####### 마운트
  useEffect(() => {
    setIsFirstRender(false);
    getDraftDates();

    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 필터 변경
  useEffect(() => {
    if (isFirstRender || !selectedDate) return;
    setPage(1);
    setContentList([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, contentFilter, orderFilter]);

  useEffect(() => {
    if (isFirstRender || !selectedDate) return;

    loadContentList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedDate, contentFilter, orderFilter]);

  useEffect(() => {
    if (contentList === null || contentList.length === 0) {
      setAllChecked(false);
    } else {
      setAllChecked(contentList.every((content) => content.checked));
    }
  }, [contentList]);

  useEffect(() => {
    const contents: DraftContentItem[] = [];

    contentList?.forEach((content) => {
      if (content.checked !== true) return;
      contents.push(content);
      setCheckedContentList(contents);
    });
  }, [contentList]);

  useEffect(() => {
    if (!checkedContentList) return;
  }, [checkedContentList]);

  useEffect(() => {
    if (!lastPage) return;
    if (page < lastPage) {
      setHasMore(true);
    } else {
      setHasMore(false);
    }
  }, [page, lastPage, hasMore]);

  // ####### Func
  const reset = () => {
    setContentList(null);
    setSelectedDate(null);
    setCheckedContentList(null);
  };

  const getDraftDates = useCallback(async () => {
    const { data } = await getDraftDateList();
    setDraftDateList(data.drafts);
  }, [setDraftDateList]);

  const loadContentList = async () => {
    setIsLoading(true);
    if (!selectedDate) return;

    const params: SelectedDraftRequestType = {
      page: page,
      page_count: 10,
      date: selectedDate,
      sort: orderFilter,
    };

    const { data } = await getSelectedDateContentList(params);
    const LAST_PAGE = Math.ceil(data.total_rows / data.page_count);
    setLastPage(LAST_PAGE);

    const addedCheckDataContents = data.drafts.map((draft) => ({ ...draft, checked: false }));
    setContentList((prev) => {
      if (prev && page !== 1) {
        return [...prev, ...addedCheckDataContents];
      }
      return addedCheckDataContents;
    });

    setIsLoading(false);
  };

  const deleteClick = () => {
    if (!checkedContentList) return;
    alertModal('선택한 항목을 삭제 하시겠습니까?.', deleteConfirm, true);
  };
  const deleteConfirm = async () => {
    if (!checkedContentList) return;
    let checkedIDs: { studio_id: string; draft_id: string }[] = [];
    checkedIDs = checkedContentList?.map((content) => ({ studio_id: content.studio_id, draft_id: content.draft_id }));
    const params: DeleteDraftRequestType = { ids: checkedIDs };
    await deleteDraft(params);
    await loadContentList();
  };

  // 순서 필터 변경
  const changeOrderFilter = (value?: OrderFilterType) => {
    if (!value) return;
    setOrderFilter(value);
  };

  // 전체 체크박스
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

  const loadMore = () => {
    if (isLoading === false && hasMore) {
      setPage((prev) => (prev += 1));
    }
  };

  // 개별 컨텐츠 선택 체크박스 이벤트
  const checkContent = (folder: DraftContentItem) => {
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

  const reloadDates = async () => {
    await getDraftDates();
    reset();
  };

  return (
    <div className="sub_cont">
      <MacScrollbar className="left_menu sub_left">
        <DraftMenu selectedDate={selectedDate} setSelectedDate={setSelectedDate} reloadDate={reloadDates} />
      </MacScrollbar>
      <div className="sub_container">
        <div className="sub_main">
          {/* Filter */}
          <Sorting
            changeOrderFilter={changeOrderFilter}
            contentFilter={contentFilter}
            setContentFilter={setContentFilter}
          />
          <div className="cont_list">
            <div className="list_head">
              <div className="check">
                {/* Check All */}
                <input type="checkbox" id="File" checked={allChecked} onChange={selectAllContents} />
              </div>
              <div className="name">이름</div>
              <div className="savedate">저장일</div>
              <div className="type">종류</div>
            </div>
            {/* 드래프트 데이터 리스트 */}
            <DraftList loadMore={loadMore} checkContent={checkContent} />
          </div>
        </div>
        <div className="sub_btn">
          <button className="delete" onClick={deleteClick}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Draft;
