import { evaluateCopy } from '@/api/studio';
import { CopyItem } from '@/types/studio/copy';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { currentStudioInfoAtom } from '@/atoms/studioAtoms';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import useModal from '@/hooks/useModal';
import useErrorModal from '@/hooks/useErrorModal';

interface EvaluationModalProps {
  Callback?: () => void;
  copyList: CopyItem[];
}

type EvalForm = {
  good: string[] | null;
  bad: string[] | null;
};

const requiredErrorMessage = '가장 마음에 드는 문구와 가장 마음에 들지 않는 문구를 선택하세요';

const EvaluationModal = ({ Callback, copyList }: EvaluationModalProps) => {
  const { handleSubmit, setValue, watch, getValues } = useForm<EvalForm>({
    defaultValues: {
      good: [],
      bad: [],
    },
  });
  const currentStudioInfo = useAtomValue(currentStudioInfoAtom);
  const { showErrorModal } = useErrorModal();
  const { alertModal } = useModal();

  const good = watch('good');
  const bad = watch('bad');
  const [lastChecked, setLastChecked] = useState<'good' | 'bad' | null>(null);

  // good, bad 동시 선택 방지
  //   useEffect(() => {
  //     if (!bad || !good) return;
  //     const updatedBad = bad.filter((item) => !good.includes(item));
  //     if (updatedBad.length !== bad.length) {
  //       setValue('bad', updatedBad);
  //     }
  //   }, [good, bad, setValue]);
  useEffect(() => {
    if (lastChecked === 'good' && good && bad) {
      const updatedBad = bad.filter((b) => !good.includes(b));
      if (updatedBad.length !== bad.length) {
        setValue('bad', updatedBad);
      }
    } else if (lastChecked === 'bad' && good && bad) {
      const updatedGood = good.filter((g) => !bad.includes(g));
      if (updatedGood.length !== good.length) {
        setValue('good', updatedGood);
      }
    }
  }, [good, bad, setValue, lastChecked]);

  const handleCheckboxChange = (id: string, type: 'good' | 'bad') => {
    setLastChecked(type);
    const currentValue = getValues(type);
    const updatedValue = currentValue?.includes(id)
      ? currentValue.filter((value) => value !== id)
      : [...(currentValue || []), id];
    setValue(type, updatedValue);
  };

  const onInvalid: SubmitErrorHandler<EvalForm> = (err) => {
    const firstError = Object.values(err)[0]?.message as string;
    alertModal(firstError);
    return;
  };

  const onSubmit: SubmitHandler<EvalForm> = async (data) => {
    try {
      if (!data.good && !data.bad) {
        throw new Error(requiredErrorMessage);
      }

      const good = data.good ? data.good.map((id) => ({ copy_id: id, evaluation: 1 as 1 | 2 })) : [];
      const bad = data.bad ? data.bad?.map((id) => ({ copy_id: id, evaluation: 2 as 1 | 2 })) : [];
      const copies = [...good, ...bad];

      await evaluateCopy({
        studio_id: currentStudioInfo.studioId,
        copies,
      });

      if (Callback) {
        Callback();
      }
    } catch (err) {
      showErrorModal(err);
    }
  };

  return (
    <>
      <div className="evaluation modal_box">
        <div className="title">카피를 평가해주세요.</div>
        <div className="titles">가장 마음에 드는 문구와 가장 마음에 들지 않는 문구를 선택하세요.</div>
        <div className="evaluation_box">
          <div className="radio_text">
            <span>Good</span>
            <span>Bad</span>
          </div>
          <form>
            <ul>
              {copyList.map((copy) => (
                <li key={copy.id}>
                  <div className="content">{copy.text}</div>
                  <div className="radio">
                    <span>
                      <input
                        id={`${copy.id}_good`}
                        type="checkbox"
                        value={copy.id}
                        // {...register('good')}
                        checked={good?.includes(copy.id)}
                        onChange={() => handleCheckboxChange(copy.id, 'good')}
                      />
                      <label htmlFor={`${copy.id}_good`}></label>
                    </span>
                    <span>
                      <input
                        id={`${copy.id}_bad`}
                        type="checkbox"
                        value={copy.id}
                        // {...register('bad')}
                        checked={bad?.includes(copy.id)}
                        onChange={() => handleCheckboxChange(copy.id, 'bad')}
                      />
                      <label htmlFor={`${copy.id}_bad`}></label>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </form>
        </div>
        <div className="modal_btns">
          <button
            className="Save"
            disabled={(!good || !good.length) && (!bad || !bad.length)}
            onClick={handleSubmit(onSubmit, onInvalid)}
          >
            Report
          </button>
        </div>
      </div>
    </>
  );
};

export default EvaluationModal;
