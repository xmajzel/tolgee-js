import {
  FallbackLanguageOption,
  FallbackNS,
  TreeTranslationsData,
} from '../../types';

export type Options = {
  /**
   * Initial language
   */
  language?: string;
  apiUrl?: string;
  apiKey?: string;
  projectId?: number;
  /**
   * Used when auto detection is not available or is turned off
   */
  defaultLanguage?: string;
  /**
   * Languages which can be used for language detection
   * and also limits which values can be stored
   */
  availableLanguages?: string[];
  /**
   * Language which is used when no translation is available for current one
   */
  fallbackLanguage?: FallbackLanguageOption;
  /**
   * Store user language in localStorage (default: true)
   */
  enableLanguageStore?: boolean;
  /**
   * Namespaces which should be always fetched
   */
  ns?: string[];
  /**
   * Namespaces to be used to find translation when no explicit namespace set.
   */
  fallbackNs?: FallbackNS;
  /**
   * Default namespace when no namespace defined (default: '')
   */
  defaultNs: string;
  /**
   * Prefix used for fetching languages (default: 'i18n/')
   */
  filesUrlPrefix: string;
  staticData?: {
    [key: string]: TreeTranslationsData | (() => Promise<TreeTranslationsData>);
  };
};

export type State = {
  initialOptions: Options;
  activeNamespaces: Map<string, number>;
  language: string | undefined;
  pendingLanguage: string | undefined;
  isInitialLoading: boolean;
  isRunning: boolean;
};

const defaultValues: Options = {
  enableLanguageStore: true,
  defaultNs: '',
  filesUrlPrefix: 'i18n/',
};

export const initState = (
  options?: Partial<Options>,
  previousState?: State
): State => {
  const initialOptions = Object.freeze({
    ...defaultValues,
    ...previousState?.initialOptions,
    ...options,
  });
  return {
    initialOptions,
    activeNamespaces:
      previousState?.activeNamespaces || new Map<string, number>(),
    language: previousState?.language,
    pendingLanguage: previousState?.language,
    isInitialLoading: false,
    isRunning: false,
  };
};
