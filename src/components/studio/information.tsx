import styled from 'styled-components';
import Icon from '@/assets/images/studio/information_icon.png';
import cogoToast from 'cogo-toast';

interface Props {
  message: string;
}
const Information: React.FC<Props> = ({ message }) => {
  const showMessage = () => {
    cogoToast.info(message, {
      position: 'bottom-right',
    });
  };
  return <StyledSpan $Icon={Icon} onClick={showMessage}></StyledSpan>;
};

const StyledSpan = styled.span<{ $Icon: string }>`
  vertical-align: middle;
  display: inline-block;
  width: 16px;
  height: 16px;
  cursor: pointer;
  background: url(${(props) => props.$Icon}) no-repeat center center;
  background-size: 100% 100%;
  margin: 0 8px;
`;

export default Information;
