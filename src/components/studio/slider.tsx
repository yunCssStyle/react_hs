import { Range } from 'react-range'; // Range 가져오기
import styled from 'styled-components';

interface Props {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>> | ((newValue: number) => void);
  disabled?: boolean;
  min: number;
  max: number;
  step: number;
}
const Slider: React.FC<Props> = ({ value, setValue, disabled = false, min, max, step }) => {
  return (
    <StyledRange
      values={[value]}
      disabled={disabled}
      step={step}
      min={min}
      max={max}
      onChange={(values) => setValue(values[0])}
      renderTrack={({ props, children }) => (
        <Track {...props} values={[value]} $min={min} $max={max}>
          {children}
        </Track>
      )}
      renderThumb={({ props }) => <Thumb {...props} />}
    />
  );
};

const StyledRange = styled(Range)`
  height: 8px;
  display: flex;
  width: 100%;
`;

const Track = styled.div<{ values: number[]; $min: number; $max: number }>`
  height: 4px;
  width: 100%;
  border-radius: 5px;
  background-color: blue;
  background: linear-gradient(
    to right,
    #c41bff,
    #c41bff ${({ values, $min, $max }) => ((values[0] - $min) / ($max - $min)) * 100}%,
    #555 ${({ values, $min, $max }) => ((values[0] - $min) / ($max - $min)) * 100}%
  );
`;

const Thumb = styled.div`
  height: 14px;
  width: 14px;
  border-radius: 50%;
  background-color: #d9d9d9;
  display: flex;
  align-items: center;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  transform: translateX(-50%);
  top: 0px;
  position: absolute;

  &:focus {
    outline: none;
  }
`;
export default Slider;
