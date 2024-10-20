import styled from 'styled-components';
import KeywordItem from './keyword_item';
import { keywordsAtom } from '@/atoms/studioAtoms';
import { useAtom } from 'jotai';
import React, { useState } from 'react';

interface Props {
  disabled: boolean;
}
const KeywordInput: React.FC<Props> = ({ disabled }) => {
  const [keywordList, setKeywordList] = useAtom(keywordsAtom);
  const [keyword, setKeyword] = useState('');

  const addKeyword = (keyword: string) => {
    if (keyword && keyword.trim() !== '') {
      if (keyword.includes(',')) return;
      if (keywordList.includes(keyword)) return;
      if (keywordList.length >= 30) return;
      const next = [...keywordList, keyword];
      setKeywordList(next);
      setKeyword('');
    }
  };
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addKeyword(keyword);
    }
  };

  // 키워드에 ',' 문자가 들어가면 안 됨
  const handleChangeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) return;
    setKeyword(value);
  };

  const handleClickButton = () => {
    if (disabled) return;
    addKeyword(keyword);
  };

  return (
    <>
      <div className="keyword-container">
        <input
          disabled={disabled}
          className="keyword"
          placeholder="키워드를 입력해주세요."
          type="text"
          onChange={handleChangeKeyword}
          onKeyUp={handleKeyUp}
          value={keyword}
        />
        <div className="search" onClick={handleClickButton}></div>
      </div>
      <List>
        {keywordList?.length > 0 && (
          <ul>
            {keywordList.map((item: string, index) => (
              <KeywordItem disabled={disabled} key={index} text={item}></KeywordItem>
            ))}
          </ul>
        )}
      </List>
    </>
  );
};

const List = styled.div`
  padding-top: 0 !important;

  ul {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

export default KeywordInput;
