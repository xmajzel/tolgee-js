const handshakeWithExtension = jest.fn(() => Promise.resolve());
const loadInContextLib = jest.fn(() => Promise.resolve(() => {}));

jest.mock('../tools/plugin', () => ({
  handshakeWithExtension,
}));

import {
  IN_CONTEXT_EXPORT_NAME,
  IN_CONTEXT_FILE,
  IN_CONTEXT_UMD_NAME,
} from '../BrowserExtensionPlugin/constants';

jest.mock('../BrowserExtensionPlugin/loadInContextLib', () => ({
  loadInContextLib,
}));

import { Tolgee } from '@tolgee/core';
import { BrowserExtensionPlugin } from '../typedIndex';
import {
  API_KEY_LOCAL_STORAGE,
  API_URL_LOCAL_STORAGE,
} from '../BrowserExtensionPlugin/BrowserExtensionPlugin';
import fs from 'fs/promises';
import path from 'path';

describe('compatibility with browser extension', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('sends correct data to extension', async () => {
    const tolgee = Tolgee({ language: 'en', apiUrl: 'test' });
    tolgee.use(BrowserExtensionPlugin());
    await tolgee.run();
    expect(handshakeWithExtension).toBeCalledTimes(1);
    expect(handshakeWithExtension).toBeCalledWith({
      config: {
        apiKey: '',
        apiUrl: 'test',
      },
      mode: 'production',
      uiPresent: true,
      uiVersion: undefined,
    });
  });

  it('loads in-context lib if session storage is set', async () => {
    sessionStorage.setItem(API_KEY_LOCAL_STORAGE, 'test');
    sessionStorage.setItem(API_URL_LOCAL_STORAGE, 'test');

    const tolgee = Tolgee({ language: 'en' });
    tolgee.use(BrowserExtensionPlugin());
    await tolgee.run();

    expect(loadInContextLib).toBeCalledTimes(1);
  });

  it('builded module is valid', async () => {
    // this test works only after build
    const fileContent = await fs.readFile(
      path.join(__dirname, `../../dist/${IN_CONTEXT_FILE}`)
    );
    expect(fileContent.toString().includes(IN_CONTEXT_UMD_NAME)).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = await import(`../../dist/${IN_CONTEXT_FILE}`);
    expect(typeof module[IN_CONTEXT_EXPORT_NAME]).toEqual('function');
  });
});
