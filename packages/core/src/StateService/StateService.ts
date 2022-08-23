import { EventServiceType } from '../EventService';
import {
  CacheAsyncRequests,
  CacheDescriptor,
  CacheKeyObject,
  Options,
} from '../types';
import {
  cacheAddRecord,
  cacheChangeTranslation,
  cacheGetRecord,
  cacheGetTranslation,
} from './Cache/Cache';
import { encodeCacheKey } from './Cache/helpers';
import { initState, State } from './initState';

export const StateService = (
  options: Options,
  eventService: EventServiceType
) => {
  const state: State = initState(options);

  const asyncRequests: CacheAsyncRequests = new Map();

  const isFetching = () => {
    return asyncRequests.size > 0;
  };

  const withDefaultNs = (descriptor: CacheDescriptor): CacheKeyObject => {
    return {
      namespace:
        descriptor.namespace === undefined
          ? state.initialOptions.defaultNs
          : descriptor.namespace,
      language: descriptor.language,
    };
  };

  const addActiveNs = async (namespace: string) => {
    const value = state.activeNamespaces.get(namespace);
    if (value !== undefined) {
      state.activeNamespaces.set(namespace, value + 1);
    } else {
      state.activeNamespaces.set(namespace, 1);
    }
    const data = cacheGetRecord(state.cache, {
      language: state.language,
      namespace,
    });
    if (!data) {
      await loadRecord({ namespace, language: state.language });
    }
  };

  const removeActiveNs = (ns: string) => {
    const value = state.activeNamespaces.get(ns);
    if (value !== undefined && value > 1) {
      state.activeNamespaces.set(ns, value - 1);
    } else {
      state.activeNamespaces.delete(ns);
    }
  };

  const getRequiredNamespaces = () => {
    return Array.from(
      new Set([
        ...(state.initialOptions.ns || [state.initialOptions.defaultNs]),
        ...state.activeNamespaces.keys(),
      ])
    );
  };

  const loadRequiredRecords = async (lang?: string) => {
    const language = lang || state.language;
    const namespaces = getRequiredNamespaces();
    await Promise.all(
      namespaces
        .filter(
          (namespace) => !cacheGetRecord(state.cache, { language, namespace })
        )
        .map((namespace) => loadRecord({ language, namespace }))
    );
  };

  const loadInitial = async () => {
    state.isLoading = true;
    await loadRequiredRecords();
    state.isLoading = false;
    eventService.onInitialLoaded.emit();
  };

  const changeLanguage = async (language: string) => {
    if (state.pendingLanguage === language && state.language === language) {
      return;
    }
    state.pendingLanguage = language;
    eventService.onPendingLanguageChange.emit(language);

    loadRequiredRecords(language);

    if (language === state.pendingLanguage) {
      // there might be parallel language change
      // we only want to apply latest
      state.language = language;
      eventService.onLanguageChange.emit(language);
    }
  };

  const getTranslation = (key: string, namespace?: string) => {
    return cacheGetTranslation(
      state.cache,
      withDefaultNs({ namespace, language: state.language }),
      key
    );
  };

  const changeTranslation = (
    descriptor: CacheDescriptor,
    key: string,
    value: string
  ) => {
    const keyObject = withDefaultNs(descriptor);
    cacheChangeTranslation(state.cache, keyObject, key, value);
    eventService.onKeyChange.emit(key);
  };

  const loadRecord = async (descriptor: CacheDescriptor) => {
    const keyObject = withDefaultNs(descriptor);
    const staticDataValue =
      state.initialOptions.staticData?.[encodeCacheKey(keyObject)];
    const cacheKey = encodeCacheKey(keyObject);
    const existingPromise = asyncRequests.get(cacheKey);

    if (existingPromise) {
      return existingPromise;
    }

    if (typeof staticDataValue === 'function') {
      const dataPromise = staticDataValue();
      const fetchingBefore = isFetching();
      asyncRequests.set(cacheKey, dataPromise);
      if (!fetchingBefore) {
        eventService.onFetchingChange.emit(true);
      }
      const data = await dataPromise;
      asyncRequests.delete(cacheKey);
      cacheAddRecord(state.cache, withDefaultNs(descriptor), 'prod', data);
      if (!isFetching()) {
        eventService.onFetchingChange.emit(false);
      }
    }
    return cacheGetRecord(state.cache, withDefaultNs(descriptor));
  };

  return Object.freeze({
    get state() {
      return state;
    },
    changeLanguage,
    getTranslation,
    changeTranslation,
    addActiveNs,
    removeActiveNs,
    loadRequiredRecords,
    loadRecord,
    isFetching,
    loadInitial,
  });
};
