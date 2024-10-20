import styled from 'styled-components';
import Remove from '@/assets/images/studio/icon_remove.png';
import { keywordsAtom } from '@/atoms/studioAtoms';
import { useAtom } from 'jotai';

interface Props {
  text: string;
  disabled: boolean;
}

const KeywordItem: React.FC<Props> = ({ text, disabled }) => {
  const [keywordList, setKeywordList] = useAtom(keywordsAtom);

  const removeKeyword = () => {
    if (disabled) return;
    const next = keywordList.filter((item) => item !== text);
    setKeywordList(next);
  };
  return (
    <Item $Icon={Remove}>
      <div className="text">{text}</div>
      <div className="remove" onClick={removeKeyword}></div>
    </Item>
  );
};

const Item = styled.div<{ $Icon: string }>`
  background-color: #c41bff;
  color: #fff;
  padding: 0 15px;
  height: 30px;
  border-radius: 20px;
  align-items: center;
  max-width: 100%;
  display: flex;
  gap: 10px;

  .text {
    white-space: nowrap;
    overflow: hidden;
    height: 30px;
    text-overflow: ellipsis;
    line-height: 30px;
    flex-grow: 1;
  }

  .remove {
    background-color: blue;
    background: url(${(props) => props.$Icon});
    width: 16px;
    height: 16px;
    background-position: center center;
    background-size: 12px 12px;
    background-repeat: no-repeat;
    cursor: pointer;
    flex-grow: 0;
    flex-shrink: 0;
  }
`;
export default KeywordItem;
