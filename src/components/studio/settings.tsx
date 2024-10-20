import React, { useCallback, useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import { getPromptList, createBanner, generateCopy, getPromptAttribute } from '@/api/studio';
import { AttributeList, ProductItem, PromptCategory } from '@/types/studio/prompt';
import { useForm, SubmitHandler, Controller, SubmitErrorHandler } from 'react-hook-form';
import useModal from '@/hooks/useModal';
import useErrorModal from '@/hooks/useErrorModal';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  copyListAtom,
  currentStudioInfoAtom,
  hasCopyAtom,
  isGeneratedCopyAtom,
  isCopyLoadingAtom,
  isFabricCanvasReadyAtom,
  studioImageAtom,
  copyCancelToken,
  isOpenDetailSettingsAtom,
  temperatureAtom,
  attributeAtom,
} from '@/atoms/studioAtoms';
import { ValidationErrors } from '@/constants/errorMessages';

import { BannerForm, PromptOption } from '@/types/studio';
import axios from 'axios';
import TextareaAutoSize from 'react-textarea-autosize';

import Slider from '@/components/studio/slider';
import KeywordInput from '@/components/studio/keyword_input';
import { Tooltip } from 'react-tooltip';

const TEMPERATURE_MIN = 0.7;
const TEMPERATURE_MAX = 1.7;
const TEMPERATURE_STEP = 0.1;

const Settings = () => {
  // 프롬프트 전체 값
  const [promptList, setPromptList] = useState<ProductItem[]>([]);
  // 소구점 전체
  const [attributes, setAttributes] = useState<AttributeList[]>([]);

  // 프롬프트 셀렉트 옵션
  const [productOptions, setProducOptions] = useState<PromptOption[]>([]);
  const [brandOptions, setBrandOptions] = useState<PromptOption[]>([]);
  const [fascinateOptions, setFascinateOptions] = useState<PromptOption[]>([]);
  const [campaignOptions, setCampaignOptions] = useState<PromptOption[]>([]);

  const [currentAttribute, setCurrentAttribute] = useAtom(attributeAtom);

  // 스튜디오 정보
  const [currentStudioInfo, setCurrentStudioInfo] = useAtom(currentStudioInfoAtom);
  const studioImage = useAtomValue(studioImageAtom);
  const hasCopy = useAtomValue(hasCopyAtom);
  const [isGeneratedCopy, setIsGeneratedCopy] = useAtom(isGeneratedCopyAtom);

  // 상세 설정
  const [isOpenDetailSettings, setIsOpenDetailSettings] = useAtom(isOpenDetailSettingsAtom);
  const [temperature, setTemperature] = useAtom(temperatureAtom);
  const [temperatureInput, setTemperatureInput] = useState<number | string>(temperature);

  // 로딩
  const setIsFabricCanvasReady = useSetAtom(isFabricCanvasReadyAtom);
  const [isCopyLoading, setIsCopyLoading] = useAtom(isCopyLoadingAtom);

  // 카피리스트
  const setCopyList = useSetAtom(copyListAtom);

  const { alertModal } = useModal();
  const { showErrorModal } = useErrorModal();

  // 카피 취소 토큰
  const [, setCancelToken] = useAtom(copyCancelToken);

  // 디폴트 소구점
  const [isDefaultAttribute, setIsDefaultAttribute] = useState(false);

  /**
   * 프롬프트
   */
  const createPromptArrayFromForm = (data: BannerForm) => {
    const promptArray = [];

    if (data.product) {
      promptArray.push({ id: data.product.value, name: data.product.label, type: PromptCategory.제품 });
    }

    if (data.brand) {
      promptArray.push({ id: data.brand.value, name: data.brand.label, type: PromptCategory.브랜드 });
    }

    if (data.fascinate) {
      promptArray.push({ id: data.fascinate.value, name: data.fascinate.label, type: PromptCategory.관심사 });
    }

    if (data.campaign) {
      promptArray.push({ id: data.campaign.value, name: data.campaign.label, type: PromptCategory.캠페인목표 });
    }

    return promptArray;
  };

  const revertPromptsToSelectOptions = (prompts: { id: string; name: string; type: PromptCategory }[]) => {
    let product;
    let brand;
    let fascinate;
    let campaign;

    prompts.forEach((prompt) => {
      const { id, name, type } = prompt;

      switch (type) {
        case PromptCategory.제품:
          product = { value: id, label: name };
          break;
        case PromptCategory.브랜드:
          brand = { value: id, label: name };
          break;
        case PromptCategory.관심사:
          fascinate = { value: id, label: name };
          break;
        case PromptCategory.캠페인목표:
          campaign = { value: id, label: name };
          break;
      }
    });

    return { product, brand, fascinate, campaign };
  };

  const { register, watch, control, handleSubmit, reset, getValues } = useForm<BannerForm>();

  /**
   * 프롬프트 비활성화 여부
   * - generate 버튼 누르자마자, 카피가 로딩 중인 동안
   * - 카피가 생성 완료되었고 카피가 있을 때
   * - 아카이브에서 열었을 때는 활성화됨 (요구사항)
   * - 히스토리에서 열었을 때는 비활성화 (요구사항)
   */

  const isDisabled = useMemo(() => {
    return (isGeneratedCopy && hasCopy) || isCopyLoading;
  }, [isCopyLoading, isGeneratedCopy, hasCopy]);

  /**
   * form watch
   */

  // 셀렉트
  const currentProduct = watch('product');
  const currentBrand = watch('brand');
  const currentFascinate = watch('fascinate');
  // const currentCampaign = watch('campaign');
  // 현재 폼  input
  const currentFilename = watch('filename');
  const currentDetail = watch('detail');

  // 인풋 값으로 스튜디오 정보 값을 변경
  const changeStudioInfo = useCallback(
    (key: 'filename' | 'detail', value: string) => {
      setCurrentStudioInfo((prevState) => ({ ...prevState, [key]: value }));
    },
    [setCurrentStudioInfo],
  );

  const initPromptOptions = async () => {
    const options = revertPromptsToSelectOptions(currentStudioInfo.prompts);
    reset({
      filename: currentStudioInfo.filename,
      detail: currentStudioInfo.detail,
      ...options,
    });
    const {
      data: { products },
    } = await getPromptList(PromptCategory.전체);
    setPromptList(products);
    setProducOptions(products.map((item) => ({ value: item.product_id, label: item.name })));
  };

  /**
   * details
   */

  const initAttribute = async () => {
    const { data } = await getPromptAttribute();
    setAttributes(data.list);
  };

  const handleTemperatureInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperatureInput(e.target.value);
  };

  const changeTemperatureInput = (value: number) => {
    if (typeof value !== 'number') {
      setTemperatureInput(temperature);
    }

    if (value > TEMPERATURE_MAX) {
      value = TEMPERATURE_MAX;
    }

    if (value < TEMPERATURE_MIN) {
      value = TEMPERATURE_MIN;
    }

    setTemperature(value);
    setTemperatureInput(value);
  };

  const handleBlurTemperature = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numberValue = Number(value);
    changeTemperatureInput(numberValue);
  };

  const handleEnterTemperature = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const { value } = e.target as HTMLInputElement;
      const numberValue = Number(value);
      if (typeof numberValue !== 'number') return;
      changeTemperatureInput(numberValue);
      // (e.target as HTMLInputElement).blur();
    }
  };

  const handleAttributeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    setCurrentStudioInfo((prevState) => ({ ...prevState, attribute: value }));
  };

  /**
   * 폼 전송
   */
  const onInvalid: SubmitErrorHandler<BannerForm> = (err) => {
    const firstError = Object.values(err)[0]?.message as string;
    alertModal(firstError);
  };

  const onSubmit: SubmitHandler<BannerForm> = async (data) => {
    const cancelToken = axios.CancelToken.source();

    try {
      setIsFabricCanvasReady(false);

      const prompts = createPromptArrayFromForm(data);

      const { data: bannerInfo } = await createBanner({
        prompts,
      });

      const studioId = bannerInfo.studio_id;

      setCurrentStudioInfo({
        ...currentStudioInfo,
        studioId,
      });

      setIsFabricCanvasReady(true);

      setCancelToken(cancelToken);

      setIsCopyLoading(true);
      const {
        data: { copies, refresh_count, copy_pid },
      } = await generateCopy(
        {
          studio_id: studioId,
          prompts,
          temperature,
          attribute: currentAttribute,
          keywords: currentStudioInfo.keywords,
        },
        { cancelToken: cancelToken.token },
      );
      setCopyList(copies);
      setCurrentStudioInfo({
        ...currentStudioInfo,
        studioId,
        filename: data.filename,
        detail: data.detail,
        prompts,
        copyCount: refresh_count,
        copyPId: copy_pid,
      });

      setIsGeneratedCopy(true);
      setIsCopyLoading(false);
    } catch (err) {
      cancelToken.cancel();
      showErrorModal(err);
    } finally {
      setIsCopyLoading(false);
    }
  };

  const handleClickSubmitButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSubmit(onSubmit, onInvalid)();
  };

  /**
   * useEffect
   */

  useEffect(() => {
    // mounted
    initPromptOptions();
    initAttribute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    changeStudioInfo('filename', currentFilename);
  }, [currentFilename, changeStudioInfo]);

  useEffect(() => {
    changeStudioInfo('detail', currentDetail);
  }, [currentDetail, changeStudioInfo]);

  useEffect(() => {
    return () => {
      const data = getValues();
      const prompts = createPromptArrayFromForm(data);
      setCurrentStudioInfo((prev) => ({
        ...prev,
        filename: data.filename,
        detail: data.detail,
        prompts,
      }));
    };
  }, [getValues, setCurrentStudioInfo]);

  // form reset
  useEffect(() => {
    setCurrentStudioInfo({ ...currentStudioInfo, resetFn: reset });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, setCurrentStudioInfo, studioImage, isCopyLoading, isDisabled, currentProduct]);

  useEffect(() => {
    if (currentProduct) {
      const initialLists = {
        brandList: [] as PromptOption[],
        fascinateList: [] as PromptOption[],
        campaignList: [] as PromptOption[],
      };

      const filteredList = promptList.filter((item) => item.product_id === currentProduct?.value)[0]?.items || [];

      const { brandList, fascinateList, campaignList } = filteredList.reduce((acc, item) => {
        if (item.type === PromptCategory.브랜드) {
          acc.brandList.push({ label: item.name, value: item.item_id });
        } else if (item.type === PromptCategory.관심사) {
          acc.fascinateList.push({ label: item.name, value: item.item_id });
        } else if (item.type === PromptCategory.캠페인목표) {
          acc.campaignList.push({ label: item.name, value: item.item_id });
        }
        return acc;
      }, initialLists);

      setBrandOptions(brandList);
      setFascinateOptions(fascinateList);
      setCampaignOptions(campaignList);
    } else {
      setBrandOptions([]);
      setFascinateOptions([]);
      setCampaignOptions([]);
    }
  }, [currentProduct, promptList, currentStudioInfo, setCurrentAttribute]);

  useEffect(() => {
    // 관심사에 따른 소구점 변경
    const getDefaultAttribute = () => {
      const products = attributes?.filter((list) => list.product_id === currentProduct?.value)[0]?.brands || [];
      const brands = products?.filter((product) => product.brand_id === currentBrand?.value)[0]?.attributes || [];
      const attributeItem = brands?.filter((brand) => brand.item_id === currentFascinate?.value)[0] || [];

      if (attributeItem) {
        setCurrentStudioInfo((prevState) => ({ ...prevState, attribute: attributeItem.attribute }));
        setCurrentAttribute(attributeItem.attribute);
      }
    };

    if (isDefaultAttribute) {
      getDefaultAttribute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFascinate?.value]);

  useEffect(() => {
    setTemperatureInput(temperature);
  }, [temperature]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="settings_cont">
        <ul>
          <li>
            <label htmlFor="title">제목*</label>
            <div>
              <input
                type="text"
                id="title"
                autoComplete="off"
                placeholder="파일명 제목을 입력하세요."
                {...register('filename', { required: ValidationErrors.REQUIRED_FILENAME })}
              />
            </div>
          </li>
          <li>
            <label htmlFor="explanation">설명*</label>
            <div>
              <input
                type="text"
                id="explanation"
                autoComplete="off"
                placeholder="상세 설명을 입력하세요."
                {...register('detail', { required: ValidationErrors.REQUIRED_DETAIL })}
              />
            </div>
          </li>
          <h2>Prompt Settings</h2>
          <li>
            <label htmlFor="product">제품*</label>
            <div>
              <Controller
                control={control}
                name="product"
                rules={{ required: ValidationErrors.REQUIRED_PRODUCT }}
                render={({ field: { onChange, ref, value } }) => (
                  <Select
                    className="select"
                    classNamePrefix="select"
                    placeholder="제품 선택"
                    inputId="product"
                    onKeyDown={(e) => e.preventDefault()}
                    isDisabled={isDisabled}
                    ref={ref}
                    value={value ? value : null}
                    options={productOptions}
                    onChange={(option) => {
                      reset({
                        product: option!,
                      });
                      onChange(option);
                    }}
                  />
                )}
              ></Controller>
            </div>
          </li>
          <li>
            <label htmlFor="brand">브랜드*</label>
            <div>
              <Controller
                control={control}
                name="brand"
                rules={{ required: ValidationErrors.REQUIRED_BRAND }}
                render={({ field: { onChange, ref, value } }) => (
                  <Select
                    className="select"
                    onKeyDown={(e) => e.preventDefault()}
                    classNamePrefix="select"
                    placeholder="브랜드 선택"
                    isDisabled={isDisabled || !currentProduct}
                    inputId="brand"
                    ref={ref}
                    value={value ? value : null}
                    options={brandOptions}
                    onChange={(option) => onChange(option)}
                  />
                )}
              ></Controller>
            </div>
          </li>
          <li>
            <label htmlFor="fascinate">관심사*</label>
            <div>
              <Controller
                control={control}
                name="fascinate"
                rules={{ required: ValidationErrors.REQUIRED_FASCINATE }}
                render={({ field: { onChange, ref, value } }) => (
                  <Select
                    className="select"
                    classNamePrefix="select"
                    placeholder="관심사 선택"
                    inputId="fascinate"
                    onKeyDown={(e) => e.preventDefault()}
                    isDisabled={isDisabled || !currentBrand}
                    value={value ? value : null}
                    ref={ref}
                    options={fascinateOptions}
                    onChange={(option) => {
                      setIsDefaultAttribute(true);
                      onChange(option);
                    }}
                  />
                )}
              ></Controller>
            </div>
          </li>
          <li>
            <label htmlFor="campaign">캠페인 목표*</label>
            <div>
              <Controller
                control={control}
                name="campaign"
                rules={{ required: ValidationErrors.REQUIRED_CAMPAIGN }}
                render={({ field: { onChange, ref, value } }) => (
                  <Select
                    className="select"
                    classNamePrefix="select"
                    isDisabled={isDisabled || !currentFascinate}
                    placeholder="캠페인 목표 선택"
                    inputId="campagin"
                    onKeyDown={(e) => e.preventDefault()}
                    value={value ? value : null}
                    ref={ref}
                    options={campaignOptions}
                    onChange={(option) => onChange(option)}
                  />
                )}
              ></Controller>
            </div>
          </li>

          <h2
            className={`toggle ${isOpenDetailSettings ? 'open' : 'close'}`}
            onClick={() => setIsOpenDetailSettings((prev) => !prev)}
          >
            Detail Settings
          </h2>
          {isOpenDetailSettings && (
            <>
              <li>
                <div className="range-container">
                  <div className="left">
                    <label>
                      표현 자유도
                      <span data-tooltip-id="expression" className="tooltip" />
                      <Tooltip
                        id="expression"
                        className="tooltip_tx"
                        place="bottom"
                        html="AI의 표현 자유도를 조절할 수 있으며, 숫자가 높을수록 자유로운 카피가 생성됩니다.<br />(입력 범위: 0.7 ~ 1.7)"
                      />
                    </label>
                    <Slider
                      value={currentStudioInfo.temperature}
                      setValue={setTemperature}
                      min={TEMPERATURE_MIN}
                      max={TEMPERATURE_MAX}
                      step={TEMPERATURE_STEP}
                      disabled={isDisabled}
                    />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    className="range-input"
                    value={temperatureInput}
                    onChange={handleTemperatureInput}
                    onBlur={handleBlurTemperature}
                    onKeyDown={handleEnterTemperature}
                    disabled={isDisabled}
                  ></input>
                </div>
              </li>
              <li>
                <label>
                  반영 키워드
                  <span data-tooltip-id="reflection" className="tooltip" />
                  <Tooltip
                    id="reflection"
                    className="tooltip_tx"
                    place="bottom"
                    html="입력한 키워드를 반영한 카피가 생성됩니다."
                  />
                </label>

                <KeywordInput disabled={isDisabled} />
              </li>
              <li>
                <label>
                  소구점 상세 설명
                  <span data-tooltip-id="explanation" className="tooltip" />
                  <Tooltip
                    id="explanation"
                    className="tooltip_tx"
                    place="bottom"
                    html="생성할 카피의 소구점을 직접 입력하거나 수정할 수 있습니다."
                  />
                </label>
                <TextareaAutoSize
                  disabled={isDisabled}
                  value={currentStudioInfo.attribute}
                  onChange={handleAttributeInput}
                  placeholder="추가 스크립트를 작성해 보세요."
                />
              </li>
            </>
          )}
        </ul>
        <button type="button" onClick={handleClickSubmitButton} disabled={isDisabled}>
          Generate
        </button>
      </form>
    </>
  );
};

export default Settings;
