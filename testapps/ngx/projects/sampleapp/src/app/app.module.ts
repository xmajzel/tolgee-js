import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { IndexComponent } from './pages/index/index.component';
import { TranslationMethodsComponent } from './pages/translation-methods/translation-methods.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { LangSelectorComponent } from './component/lang-selector/lang-selector.component';

import {
  BackendFetch,
  NgxTolgeeModule,
  Tolgee,
  NgxPlugin,
  TOLGEE_INSTANCE,
} from '@tolgee/ngx';
import { BrowserModule } from '@angular/platform-browser';
import { FormatIcu } from '@tolgee/format-icu';
import { FormsModule } from '@angular/forms';
import { wait } from './wait';
import { TOLGEE_LOADING_TEMPLATE } from '@tolgee/ngx';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    IndexComponent,
    AppComponent,
    TranslationMethodsComponent,
    NavbarComponent,
    LangSelectorComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    NgxTolgeeModule,
    FormsModule,
    CommonModule,
  ],
  exports: [AppRoutingModule, NavbarComponent],
  providers: [
    {
      provide: TOLGEE_LOADING_TEMPLATE,
      useValue: '<p>loading...</p>',
    },
    {
      provide: TOLGEE_INSTANCE,
      useFactory: () => {
        return Tolgee()
          .use(FormatIcu())
          .use(NgxPlugin())
          .use(BackendFetch({}))
          .init({
            availableLanguages: ['en', 'cs', 'fr', 'de'],
            staticData: {
              'en:submodule': async () => {
                const data = import('../i18n/submodule/en.json');
                await wait(1000);
                return data;
              },
              en: () => import('../i18n/en.json'),
              cs: () => import('../i18n/cs.json'),
              de: () => import('../i18n/de.json'),
              fr: () => import('../i18n/fr.json'),
            },
            apiUrl: environment.tolgeeApiUrl,
            apiKey: environment.tolgeeApiKey,
            fallbackLanguage: 'en',
            defaultLanguage: 'en',
          });
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}