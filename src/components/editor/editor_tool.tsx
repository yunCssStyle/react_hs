import { fabricCanvasAtom, textOptionsAtom } from '@/atoms/studioAtoms';
import { useAtom, useAtomValue } from 'jotai';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { TextOptions } from '../studio/fabricCanvas';
import styled from 'styled-components';
import { type RGBColor, SketchPicker } from 'react-color';
import Select, { OptionProps, SingleValue, SingleValueProps, components } from 'react-select';
import AlignLeft from '@/assets/images/studio/icon_align_left.png';
import AlignCenter from '@/assets/images/studio/icon_align_center.png';
import AlignRight from '@/assets/images/studio/icon_align_right.png';
import {
  FontFamily,
  FontSelectItem,
  FontSizeSelectItem,
  FontStyleSelectItem,
  fontSelectOptions,
  fontSize,
  fontStyles,
  getStyles,
} from '@/constants/studioFonts';
import CreatableSelect from 'react-select/creatable';

type TextAlignType = {
  label: string;
  value: 'left' | 'center' | 'right';
  image: string;
};
const options: TextAlignType[] = [
  {
    label: 'left',
    value: 'left',
    image: AlignLeft,
  },
  {
    label: 'center',
    value: 'center',
    image: AlignCenter,
  },
  {
    label: 'right',
    value: 'right',
    image: AlignRight,
  },
];

interface Props {
  isTextSelected?: boolean;
  setIsTextSelected?: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
  addText?: boolean;
}
const EditorTool: React.FC<Props> = ({
  addText = false,
  disabled = false,
  isTextSelected = false,
  setIsTextSelected,
}) => {
  const fabricCanvas = useAtomValue(fabricCanvasAtom);
  const [textOptions, setTextOptions] = useAtom(textOptionsAtom);
  const [isShowFillColor, setisShowFillColor] = useState(false);
  const [isShowTextBackgroundColor, setIsShowTextBackgroundColor] = useState(false);

  const [fontName, setFontName] = useState<FontFamily>('Pretendard');
  const [fontStyleOptions, setFontStyleOptions] = useState<FontStyleSelectItem[]>([]);
  const { SingleValue, Option } = components;

  const colorRef = useRef<HTMLDivElement>(null);

  const textAlignOption = options.find((option) => option.value === textOptions.textAlign);
  const fontSizeOption =
    fontSize.find((option) => option.value === textOptions.fontSize) ||
    ({
      label: Math.round(textOptions.fontSize!),
      value: textOptions.fontSize,
    } as FontSizeSelectItem);

  const fontStyleOption = fontStyleOptions.find((option) => {
    return option.value === textOptions.fontFamily;
  }) || { value: 'Pretendard', label: 'Regular' };

  const getFontFamilyKeyFromStyle = (style?: string): FontFamily => {
    for (const [key, styles] of Object.entries(fontStyles)) {
      if (Object.values(styles).includes(style)) {
        return key as FontFamily;
      }
    }
    return 'Pretendard'; // 기본값
  };

  const fontFamilyOption = fontSelectOptions.find((option) => {
    const fontFamilyKey = getFontFamilyKeyFromStyle(textOptions.fontFamily);
    return option.value === fontFamilyKey;
  }) || { value: 'Pretendard', label: 'Pretendard' };

  const toggleText = useCallback(() => {
    if (!setIsTextSelected) return;
    if (disabled) return;
    setIsTextSelected((prev) => !prev);
  }, [setIsTextSelected, disabled]);

  const changeTextOptions = (payload: TextOptions) => {
    if (disabled) return;

    const next = {
      ...textOptions,
      ...payload,
    };
    setTextOptions(next);
  };

  const changeAndAdjustText = (option: TextOptions) => {
    if (disabled) return;

    changeTextOptions(option);
    fabricCanvas?.changeSelectedTextOptions(option);
  };

  const toggleItalic = () => {
    if (disabled) return;

    const prev = textOptions.fontStyle;
    changeAndAdjustText({ fontStyle: prev === 'italic' ? 'normal' : 'italic' });
  };

  const toggleBold = () => {
    if (disabled) return;

    const prev = textOptions.fontWeight;
    changeAndAdjustText({ fontWeight: prev === 'bold' ? 'normal' : 'bold' });
  };

  const toggleUnderline = () => {
    if (disabled) return;

    const prev = textOptions.underline;
    changeAndAdjustText({ underline: !prev });
  };

  const toggleLineThrogh = () => {
    if (disabled) return;

    const prev = textOptions.linethrough;
    changeAndAdjustText({ linethrough: !prev });
  };

  const toggleColor = (e: React.MouseEvent, type: 'fill' | 'textBackgroundColor') => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    switch (type) {
      case 'fill':
        setisShowFillColor((prev) => !prev);
        break;

      case 'textBackgroundColor':
        setIsShowTextBackgroundColor((prev) => !prev);
        break;

      default:
        break;
    }
  };

  const resetTextBackgroundColor = () => {
    changeTextOptions({ textBackgroundColor: '' });
    fabricCanvas?.changeSelectedTextOptions({ textBackgroundColor: '' });
    setIsShowTextBackgroundColor(false);
  };

  const changeTextAlign = (newValue: SingleValue<TextAlignType>) => {
    if (newValue) {
      changeAndAdjustText({ textAlign: newValue.value });
    }
  };
  const onChangeColor = (type: 'fill' | 'textBackgroundColor', rgba: RGBColor) => {
    fabricCanvas?.lockHistory();
    const { r, g, b, a } = rgba;
    const color = `rgba(${r}, ${g}, ${b}, ${a})`;
    if (type === 'fill') {
      changeFontColor(color);
    } else if (type === 'textBackgroundColor') {
      changeTextBackgroundColor(color);
    }
  };

  const handleFontFamily = (item: SingleValue<FontSelectItem>) => {
    setFontName(item?.value || 'Pretendard');
    changeFontFamily(item?.value || 'Pretendard');
  };

  const handleFontStyle = (item: SingleValue<FontStyleSelectItem>) => {
    changeFontFamily(item?.value || 'Pretendard');
  };

  const handleFontSize = (item: SingleValue<FontSizeSelectItem>) => {
    changeTextSize(item?.value || textOptions.fontSize || 24);
  };

  const onChangeCompleteColor = (type: 'fill' | 'textBackgroundColor', rgba: RGBColor) => {
    fabricCanvas?.unlockHistory();
    const { r, g, b, a } = rgba;
    const color = `rgba(${r}, ${g}, ${b}, ${a})`;
    if (type === 'fill') {
      changeFontColor(color);
    } else if (type === 'textBackgroundColor') {
      changeTextBackgroundColor(color);
    }
  };

  const changeFontColor = (fill: string) => {
    changeAndAdjustText({ fill });
  };

  const changeTextBackgroundColor = (textBackgroundColor: string) => {
    changeAndAdjustText({ textBackgroundColor });
  };

  const changeFontFamily = (fontFamily: string) => {
    changeAndAdjustText({ fontFamily });
  };

  const changeTextSize = (fontSize: number) => {
    changeAndAdjustText({ fontSize, scaleX: 1, scaleY: 1 });
  };

  const IconSingleValue = (props: SingleValueProps<TextAlignType>) => (
    <SingleValue {...props}>
      <img src={props.data.image} alt={props.data.label} style={{ height: '20px', width: '20px' }} />
    </SingleValue>
  );
  const IconOption = (props: OptionProps<TextAlignType, false>) => (
    <Option {...props}>
      <img src={props.data.image} alt={props.data.label} style={{ height: '20px', width: '20px' }} />
    </Option>
  );
  const customStyles = {
    option: (provided: any) => ({
      ...provided,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }),
  };

  useEffect(() => {
    changeFontFamily(fontName);
    const style = getStyles(fontName);
    setFontStyleOptions(style);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontName]);

  return (
    <>
      {addText ? (
        <div className="editor_t" onClick={toggleText}>
          <span className={`item select hover ${isTextSelected ? 'selected' : ''}`}>T</span>
        </div>
      ) : null}
      <div className="editor_edit">
        <div className="edit select">
          <div className="edit_select" style={{ width: '140px' }}>
            <Select
              className="item hover editselect"
              classNamePrefix="text select"
              options={fontSelectOptions}
              onChange={handleFontFamily}
              value={fontFamilyOption}
            />
          </div>
          <div className="edit_select" style={{ width: '100px' }}>
            <Select
              className="item hover editselect"
              classNamePrefix="text select"
              options={fontStyleOptions}
              onChange={handleFontStyle}
              value={fontStyleOption}
              styles={{
                control: (css: any) => ({ ...css, width: '100px' }),
              }}
            />
          </div>
          <div className="edit_select" style={{ width: '80px' }}>
            <CreatableSelect
              isClearable
              className="item hover editselect"
              classNamePrefix="select"
              options={fontSize}
              value={fontSizeOption}
              onChange={handleFontSize}
              formatCreateLabel={(inputValue) => inputValue}
            />
          </div>

          <Underscore
            $color={textOptions.textBackgroundColor as string}
            className={`item select hover underscore color ${isShowTextBackgroundColor ? 'selected' : ''}`}
            onClick={(e) => toggleColor(e, 'textBackgroundColor')}
          >
            <span className="pen"></span>
            {isShowTextBackgroundColor ? (
              <StyledSketchPicker ref={colorRef} onClick={(e) => e.stopPropagation()}>
                <div className="no-color on" onClick={resetTextBackgroundColor}>
                  색 없음
                </div>
                <div className="cover" onClick={() => setIsShowTextBackgroundColor(false)}></div>

                <SketchPicker
                  color={textOptions.textBackgroundColor as string}
                  onChange={(color) => onChangeColor('textBackgroundColor', color.rgb)}
                  onChangeComplete={(color) => onChangeCompleteColor('textBackgroundColor', color.rgb)}
                />
              </StyledSketchPicker>
            ) : null}
          </Underscore>

          <Underscore
            $color={textOptions.fill as string}
            className={`item select hover underscore color ${isShowFillColor ? 'selected' : ''}`}
            onClick={(e) => toggleColor(e, 'fill')}
          >
            <span className="font">가</span>
            {isShowFillColor ? (
              <StyledSketchPicker ref={colorRef} onClick={(e) => e.stopPropagation()}>
                <div className="cover" onClick={() => setisShowFillColor(false)}></div>
                <SketchPicker
                  color={textOptions.fill as string}
                  onChange={(color) => onChangeColor('fill', color.rgb)}
                  onChangeComplete={(color) => onChangeCompleteColor('fill', color.rgb)}
                />
              </StyledSketchPicker>
            ) : null}
          </Underscore>

          <ul className="item font-type">
            <li className={`hover bold ${textOptions.fontWeight === 'bold' ? 'selected' : ''}`} onClick={toggleBold}>
              B
            </li>
            <li
              className={`hover italic ${textOptions.fontStyle === 'italic' ? 'selected' : ''}`}
              onClick={toggleItalic}
            >
              I
            </li>
            <li className={`hover underline ${textOptions.underline ? 'selected' : ''}`} onClick={toggleUnderline}>
              U
            </li>
            <li className={`hover through ${textOptions.linethrough ? 'selected' : ''}`} onClick={toggleLineThrogh}>
              S
            </li>
          </ul>

          <div className="edit_select" style={{ width: '70px' }}>
            <Select
              className="item hover editselect"
              classNamePrefix="text select"
              styles={customStyles}
              components={{ SingleValue: IconSingleValue, Option: IconOption }}
              options={options}
              onChange={changeTextAlign}
              value={textAlignOption}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const Underscore = styled.div<{ $color: string }>`
  position: relative !important;
  &::after {
    background-color: ${(props) => props.$color || '#fff'} !important;
  }
`;

const StyledSketchPicker = styled.div`
  position: absolute;
  top: 30px;
  left: 0;
  z-index: 3;
  display: block;

  .cover {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  .no-color {
    position: relative;
    z-index: 4;
  }
  .sketch-picker {
    /* background: #333333 !important; */
  }
`;

export default EditorTool;
