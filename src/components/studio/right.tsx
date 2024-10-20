import { MacScrollbar } from 'mac-scrollbar';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import CopyItem from './copy_item';
import HistoryItem from './history_item';
import { RightProps } from '@/types/studio';
import useModal from '@/hooks/useModal';
import EvaluationModal from '../modal/evaluation';
import useErrorModal from '@/hooks/useErrorModal';
import { useAtom, useAtomValue } from 'jotai';
import {
  copyListAtom,
  currentStudioInfoAtom,
  historyListAtom,
  isCopyLoadingAtom,
  isHistoryAllDataLoadedAtom,
  isHistoryLoadingAtom,
} from '@/atoms/studioAtoms';
import Spinner from '../spinner/spinner';
import { useEffect, useRef, useState } from 'react';
import { generateCopy } from '@/api/studio';
import useStudioHistory from '@/hooks/studio/useStudioHistory';

const Right = ({ toggleRightPanel, openCopySave }: RightProps) => {
  const { closeModal, componentsModal } = useModal();
  const { showErrorModal } = useErrorModal();

  const [isCopyLoading, setIsCopyLoading] = useAtom(isCopyLoadingAtom);
  const [copyList, setCopyList] = useAtom(copyListAtom);

  const historyList = useAtomValue(historyListAtom);
  const isHistoryLoading = useAtomValue(isHistoryLoadingAtom);

  const [currentStudioInfo, setCurrentStudioInfo] = useAtom(currentStudioInfoAtom);

  const { moreFetchHistoryList } = useStudioHistory();
  const isHistoryAllDataLoaded = useAtomValue(isHistoryAllDataLoadedAtom);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  const createConfirm = async () => {
    setIsCopyLoading(true);
    closeModal();

    try {
      const {
        data: { copies, refresh_count, copy_pid },
      } = await generateCopy({
        studio_id: currentStudioInfo.studioId,
        prompts: currentStudioInfo.prompts,
        keywords: currentStudioInfo.keywords,
        attribute: currentStudioInfo.attribute,
        temperature: currentStudioInfo.temperature,
      });
      setCopyList(copies);
      setCurrentStudioInfo({ ...currentStudioInfo, copyCount: refresh_count, copyPId: copy_pid });
      closeModal();
    } catch (err) {
      showErrorModal(err);
    } finally {
      setIsCopyLoading(false);
    }
  };

  const report = () => {
    if (isCopyLoading || copyList?.length < 1) return;
    componentsModal(<EvaluationModal copyList={copyList} Callback={createConfirm} />, false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && !isHistoryLoading && !isHistoryAllDataLoaded && historyList.length > 0) {
          moreFetchHistoryList();
        }
      },
      { threshold: 1 },
    );

    const currentLoadingRef = loadingRef.current;

    if (currentLoadingRef) {
      observer.observe(currentLoadingRef);
    }

    return () => {
      if (currentLoadingRef) observer.unobserve(currentLoadingRef);
    };
  }, [isHistoryLoading, isHistoryAllDataLoaded, moreFetchHistoryList, tabIndex, historyList]);

  return (
    <div className="right_cont">
      <div className="open_btn" onClick={toggleRightPanel}></div>
      <Tabs defaultIndex={0} className="right_tab" onSelect={(index: number) => setTabIndex(index)}>
        <TabList>
          <Tab>Copy List</Tab>
          <Tab>History</Tab>
        </TabList>
        <TabPanel>
          {!isCopyLoading && copyList.length > 0 ? <div className="reset_btn" onClick={report}></div> : null}
          <MacScrollbar className="right_contScr">
            {isCopyLoading ? (
              <Spinner />
            ) : (
              <ul className="copy_list">
                {copyList.map((item) => (
                  <CopyItem openCopySave={openCopySave} key={item.id} copyItem={item} />
                ))}
              </ul>
            )}
          </MacScrollbar>
        </TabPanel>
        <TabPanel>
          <MacScrollbar className="right_contScr">
            {isHistoryLoading ? (
              <Spinner />
            ) : (
              <>
                <ul className="history_list">{historyList?.map((item) => <HistoryItem key={item.id} {...item} />)}</ul>
              </>
            )}
            <div ref={loadingRef}> </div>
          </MacScrollbar>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default Right;
