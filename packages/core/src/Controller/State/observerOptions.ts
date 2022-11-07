export type ObserverOptionsInternal = {
  tagAttributes: Record<string, string[]>;
  highlightKeys: ModifierKey[];
  highlightColor: string;
  highlightWidth: number;
  targetElement?: HTMLElement;
  restrictedElements: string[];
  inputPrefix: string;
  inputSuffix: string;
  passToParent: (keyof HTMLElementTagNameMap)[] | ((node: Element) => boolean);
};

export type ObserverOptions = Partial<ObserverOptionsInternal>;

export type ModifierKey = 'Alt' | 'Control' | 'Shift' | 'Meta';

export const defaultObserverOptions: ObserverOptionsInternal = {
  tagAttributes: {
    textarea: ['placeholder'],
    input: ['value', 'placeholder'],
    img: ['alt'],
    '*': ['aria-label', 'title'],
  },
  restrictedElements: ['script', 'style'],
  highlightKeys: ['Alt'] as ModifierKey[],
  highlightColor: 'rgb(255, 0, 0)',
  highlightWidth: 5,
  inputPrefix: '%-%tolgee:',
  inputSuffix: '%-%',
  passToParent: ['option', 'optgroup'],
};