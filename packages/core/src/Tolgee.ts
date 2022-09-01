import { EventService } from './EventService';
import { PluginService } from './PluginService/PluginService';
import { StateService } from './StateService/StateService';
import {
  BackendGetRecordProps,
  BackendPlugin,
  FormatPlugin,
  ObserverPlugin,
  Options,
  TolgeeInstance,
  TranslateProps,
  TranslatePropsInternal,
  UiLibInterface,
} from './types';

export const Tolgee = (options?: Partial<Options>): TolgeeInstance => {
  const eventService = EventService();
  const stateService = StateService(eventService, getBackendRecord, options);
  const pluginService = PluginService(
    stateService.getLanguage,
    instant,
    stateService.getBackendProps
  );

  function instant(props: TranslatePropsInternal) {
    const translation = stateService.getTranslation(props);
    return pluginService.formatTranslation({ ...props, translation });
  }

  function getBackendRecord(props: BackendGetRecordProps) {
    return pluginService.getBackendRecord(props);
  }

  eventService.onKeyUpdate.listenAll((e) => {
    pluginService.retranslate();
  });

  const tolgee: TolgeeInstance = Object.freeze({
    // event listeners
    onLanguageChange: eventService.onLanguageChange,
    onPendingLanguageChange: eventService.onPendingLanguageChange,
    onFetchingChange: eventService.onFetchingChange,
    onKeyUpdate: eventService.onKeyUpdate,
    onLoad: eventService.onInitialLoaded,

    setFormat: (formatter: FormatPlugin | undefined) => {
      pluginService.setFormat(formatter);
      return tolgee;
    },
    setObserver: (observer: ObserverPlugin | undefined) => {
      pluginService.setObserver(observer);
      return tolgee;
    },
    setUi: (ui: UiLibInterface | undefined) => {
      pluginService.setUi(ui);
      return tolgee;
    },
    addBackend: (backend: BackendPlugin | undefined) => {
      pluginService.addBackend(backend);
      return tolgee;
    },

    // state
    getLanguage: stateService.getLanguage,
    getPendingLanguage: stateService.getPendingLanguage,
    changeLanguage: stateService.changeLanguage,
    changeTranslation: stateService.changeTranslation,
    addActiveNs: stateService.addActiveNs,
    removeActiveNs: stateService.removeActiveNs,
    loadRecord: stateService.loadRecord,
    isLoading: stateService.isLoading,
    isFetching: stateService.isFetching,
    init: (options: Partial<Options>) => {
      stateService.init(options);
      return tolgee;
    },

    // other
    run: () => {
      pluginService.run();
      return stateService.loadInitial();
    },
    stop: () => {
      pluginService.stop();
    },
    instant: (props: TranslateProps) => {
      const translation = stateService.getTranslation(props);
      return pluginService.formatTranslation({
        ...props,
        translation: translation,
      });
    },
  });
  return tolgee;
};
