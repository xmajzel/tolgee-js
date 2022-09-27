jest.autoMockOff();

import '@testing-library/jest-dom';
import { VuePlugin, useTranslate, TolgeeVue } from '..';
import { render, screen, waitFor } from '@testing-library/vue';
import { Tolgee, TolgeeInstance } from '@tolgee/core';
import { FormatIcu } from '@tolgee/format-icu';
import mockTranslations from './mockTranslations';

const API_URL = 'http://localhost';

const wrapInPromise = (data: any) => () =>
  new Promise<any>((resolve) => setTimeout(() => resolve(data), 20));

describe('useTranslations namespaces', () => {
  let tolgee: TolgeeInstance;

  const TestComponent = {
    setup() {
      const { isLoading, t } = useTranslate('test');
      return { isLoading, t };
    },
    template: `
      <div>
        <div v-if="isLoading" data-testid="loading">Loading...</div>
        <div data-testid="test">{{t('test')}}</div>
        <div data-testid="test_english_fallback">
          {{t('test_english_fallback')}}
        </div>
        <div data-testid="non_existant">
          {{t('non_existant', 'Non existant')}}
        </div>
        <div data-testid="ns_fallback">
          {{t('hello_world', { ns: ['test', ''] })}}
        </div>
        <div data-testid="ns_double_fallback">
          {{t('test_english_fallback', { ns: ['test', ''] })}}
        </div>
      </div>`,
  };

  beforeEach(async () => {
    tolgee = Tolgee()
      .use(VuePlugin())
      .use(FormatIcu())
      .init({
        apiUrl: API_URL,
        language: 'cs',
        fallbackLanguage: 'en',
        staticData: {
          cs: wrapInPromise(mockTranslations.cs),
          'cs:test': wrapInPromise(mockTranslations['cs:test']),
          en: wrapInPromise(mockTranslations.en),
          'en:test': wrapInPromise(mockTranslations['en:test']),
        },
      });

    tolgee.run();
    render(TestComponent, {
      global: { plugins: [[TolgeeVue, { tolgee }]] },
    });
  });

  it('loads namespace after render', async () => {
    expect(screen.queryByTestId('loading')).toContainHTML('Loading...');
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).toBeFalsy();
      expect(screen.queryByTestId('test')).toContainHTML('Český test');
      expect(screen.queryByTestId('test')).toHaveAttribute('_tolgee');
    });
  });

  it('works with english fallback', async () => {
    await waitFor(() => {
      expect(screen.queryByTestId('test_english_fallback')).toContainHTML(
        'Test english fallback'
      );
      expect(screen.queryByTestId('test_english_fallback')).toHaveAttribute(
        '_tolgee'
      );
    });
  });

  it('works with ns fallback', async () => {
    expect(screen.queryByTestId('ns_double_fallback')).toContainHTML(
      'test_english_fallback'
    );
    await waitFor(() => {
      expect(screen.queryByTestId('ns_double_fallback')).toContainHTML(
        'Test english fallback'
      );
      expect(screen.queryByTestId('ns_double_fallback')).toHaveAttribute(
        '_tolgee'
      );
    });
  });

  it('works with language and ns fallback', async () => {
    expect(screen.queryByTestId('ns_double_fallback')).toContainHTML(
      'test_english_fallback'
    );
    await waitFor(() => {
      expect(screen.queryByTestId('ns_double_fallback')).toContainHTML(
        'Test english fallback'
      );
      expect(screen.queryByTestId('ns_double_fallback')).toHaveAttribute(
        '_tolgee'
      );
    });
  });

  it('works with default value', async () => {
    await waitFor(() => {
      expect(screen.queryByTestId('non_existant')).toContainHTML(
        'Non existant'
      );
      expect(screen.queryByTestId('non_existant')).toHaveAttribute('_tolgee');
    });
  });
});
