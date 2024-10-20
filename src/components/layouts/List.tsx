import { ListProps } from '@/types/common';
import { MacScrollbar } from 'mac-scrollbar';
import Pen from '@/assets/images/common/icon_pen.svg';
import { ContentItem } from '@/types/archive/archive';
import useStudioFile from '@/hooks/studio/useStudioFile';
import InfiniteScroll from 'react-infinite-scroll-component';
import NewFolder from '../modal/new_folder';
import useModal from '@/hooks/useModal';
import { contentAndFolder } from '@/atoms/folderAtoms';
import { useAtomValue } from 'jotai';
import cogoToast from 'cogo-toast';
import { infoMessage, userActionPrompt } from '@/constants/infoMessage';

const List = ({ checkContent, selectFolderOnList, loadMore, Callback }: ListProps) => {
  const { openFile } = useStudioFile();
  const { inputModal, closeAlertModal, alertModal } = useModal();

  const contentList = useAtomValue(contentAndFolder);

  const uppercaseFirstChar = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const copyText = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      cogoToast.info(infoMessage.COPY_SUCCESS, {
        position: 'bottom-right',
      });
    } catch (err) {
      cogoToast.error(infoMessage.COPY_FAILED, { position: 'bottom-right' });
    }
  };

  const onClickList = (item: ContentItem) => {
    switch (item.content_type) {
      case 'file':
        alertModal(userActionPrompt.IMPORT_STUDIO, () => openFile(item.id), true);
        break;
      case 'folder':
        selectFolderOnList!(item.id);
        break;
      case 'copy':
        break;
    }
  };

  const afterEditFolderName = () => {
    closeAlertModal();
    Callback!();
  };

  const editFolderName = (e: React.MouseEvent<HTMLImageElement>, item: ContentItem) => {
    e.stopPropagation();
    if (item.content_type !== 'folder') return;
    inputModal(
      <NewFolder folderID={item.id} name={item.title} title="이름 변경" Callback={() => afterEditFolderName()} />,
    );
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
          contentList.map((item: ContentItem, index: number) => (
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
              <div
                className="name"
                onClick={() => onClickList(item)}
                style={item.content_type === 'copy' ? {} : { cursor: 'pointer' }}
              >
                <div className="title_cont">
                  {item.img_url ? (
                    <div className="img" style={{ backgroundImage: `url(${item.img_url})` }}></div>
                  ) : (
                    <div className={`img noimg ${uppercaseFirstChar(item.content_type)}`} />
                  )}
                  <div className="tx">
                    <div className="title">
                      <div>{item.title}</div>
                      {item.content_type == 'folder' && <img src={Pen} onClick={(e) => editFolderName(e, item)} />}
                    </div>
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
                    <span onClick={() => copyText(item.title)}>Copy Text</span>
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
export default List;
