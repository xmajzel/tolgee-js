import {
  CombinedOptions,
  TFnType,
  TranslateOptions,
  TranslateProps,
} from './types';

function parseCombinedOptions({
  ns,
  noWrap,
  orEmpty,
  params,
  ...rest
}: CombinedOptions<any>): Partial<TranslateProps> {
  const options: Required<TranslateOptions<any>> = {
    ns: ns!,
    noWrap: noWrap!,
    orEmpty: orEmpty!,
    params: {
      ...rest,
      ...params,
    },
  };
  return options;
}

export const getTranslateParams: TFnType<any, TranslateProps<any>> = (
  keyOrProps,
  ...params
) => {
  let result = {} as TranslateProps<any>;
  let options: CombinedOptions<any> | undefined;
  if (typeof keyOrProps === 'object') {
    result = keyOrProps;
  } else {
    result.key = keyOrProps;
    if (typeof params[0] === 'string') {
      result.defaultValue = params[0];
      options = params[1] as CombinedOptions<any>;
    } else if (typeof params[0] === 'object') {
      options = params[0] as CombinedOptions<any>;
    }
  }
  if (options) {
    result = {
      ...parseCombinedOptions(options),
      ...result,
    };
  }
  return result;
};
