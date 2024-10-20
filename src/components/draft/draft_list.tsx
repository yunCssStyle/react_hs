import { MacScrollbar } from 'mac-scrollbar';
import { DraftContentItem } from '@/types/draft/draft';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useAtomValue } from 'jotai';
import { selectedDateContentItem } from '@/atoms/draftAtoms';
import useStudioFile from '@/hooks/studio/useStudioFile';
import useModal from '@/hooks/useModal';
import { userActionPrompt } from '@/constants/infoMessage';

interface DraftListProps {
  loadMore?: () => void;
  checkContent?: (item: DraftContentItem) => void;
}

const DraftList = ({ checkContent, loadMore }: DraftListProps) => {
  const { draftOpenFile } = useStudioFile();
  const contentList = useAtomValue(selectedDateContentItem);
  const { alertModal } = useModal();

  const onClickList = (item: DraftContentItem) => {
    alertModal(userActionPrompt.IMPORT_STUDIO, () => draftOpenFile(item.studio_id, item.draft_id), true);
  };

  return (
    <MacScrollbar className="list" id="MacScrollbar">
      <InfiniteScroll
        dataLength={contentList?.length ? contentList.length : 10}
        next={loadMore!}
        hasMore={true}
        loader={<></>}
        scrollableTarget="MacScrollbar"
      >
        {contentList &&
          contentList.map((item: DraftContentItem, index: number) => (
            <div className={`list_item ${item.content_type}`} key={index}>
              <div className="check">
                <input
                  type="checkbox"
                  id=""
                  checked={item.checked}
                  onChange={() => {
                    checkContent!(item);
                  }}
                />
              </div>
              <div className="name" onClick={() => onClickList(item)}>
                <div className="title_cont">
                  {item.img_url ? (
                    <div className="img" style={{ backgroundImage: `url(${item.img_url})` }}></div>
                  ) : (
                    <div className={`img noimg ${item.content_type}`} />
                  )}
                  <div className="tx">
                    <div className="title">{item.title}</div>
                    {item.detail && <div className="text">{item.detail}</div>}
                    {item.prompts && (
                      <div className="tags">
                        {item.prompts.map((prompt, index) => (
                          <span key={index}>{prompt.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {item.content_type == 'copy' && (
                  <div className="copy">
                    <span>Copy Text</span>
                  </div>
                )}
              </div>
              <div className="savedate">{item.created_at}</div>
              <div className="type">{item.content_type}</div>
            </div>
          ))}
      </InfiniteScroll>
    </MacScrollbar>
  );
};
export default DraftList;
