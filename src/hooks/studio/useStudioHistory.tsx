import { getHistoryList } from '@/api/studio';
import {
  currentStudioInfoAtom,
  historyListAtom,
  isHistoryAllDataLoadedAtom,
  isHistoryLoadingAtom,
} from '@/atoms/studioAtoms';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';

const useStudioHistory = () => {
  const [historyList, setHistoryList] = useAtom(historyListAtom);
  const setIsLoading = useSetAtom(isHistoryLoadingAtom);
  const currentStudioInfo = useAtomValue(currentStudioInfoAtom);

  const setIsHistoryAllDataLoaded = useSetAtom(isHistoryAllDataLoadedAtom);
  const [page, setPage] = useState(1);

  const fetchHistoryList = async (id = '') => {
    setPage(1);
    setIsLoading(true);
    setIsHistoryAllDataLoaded(false);

    let studioId = id;
    if (!id) {
      studioId = currentStudioInfo.studioId;
    }
    try {
      if (!studioId) {
        setHistoryList([]);
        setIsHistoryAllDataLoaded(true);
        return;
      }
      const { data } = await getHistoryList({
        studio_id: studioId,
        page: 1,
      });

      if (data.histories.length < 1) {
        throw new Error();
      }
      setIsHistoryAllDataLoaded(data.histories.length >= data.total_rows);
      setHistoryList(data.histories);
    } catch (err) {
      setHistoryList([]);
      setIsHistoryAllDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const moreFetchHistoryList = async () => {
    setIsLoading(true);
    try {
      if (!currentStudioInfo.studioId) {
        setHistoryList([]);
        setIsHistoryAllDataLoaded(true);
        return;
      }
      const { data } = await getHistoryList({
        studio_id: currentStudioInfo.studioId,
        page: page + 1,
      });

      if (data.histories.length < 1) {
        throw new Error();
      }

      const next = [...historyList, ...data.histories];
      setIsHistoryAllDataLoaded(next.length >= data.total_rows);
      setHistoryList(next);
      setPage((page) => page + 1);
    } catch (err) {
      setIsHistoryAllDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchHistoryList, moreFetchHistoryList };
};

export default useStudioHistory;
