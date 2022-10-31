import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@tolgee/ngx';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-translation-methods',
  templateUrl: './translation-methods.component.html',
})
export class TranslationMethodsComponent implements OnInit, OnDestroy {
  translatedWithoutParamsValue: string;
  translatedWithDefaultValue: string;
  translatedWithParamsValue: string;

  translatedWithoutParamsValueSubscription: Subscription;
  translatedWithDefaultValueSubscription: Subscription;
  translatedWithParamsValueSubscription: Subscription;

  changingParamValue = 'value';

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    this.translatedWithoutParamsValueSubscription = this.translateService
      .translate('this_is_a_key')
      .subscribe((val) => (this.translatedWithoutParamsValue = val));

    this.translatedWithDefaultValueSubscription = this.translateService
      .translate('this_key_does_not_exist', 'This is default')
      .subscribe((val) => (this.translatedWithDefaultValue = val));

    this.translatedWithParamsValueSubscription = this.translateService
      .translate('this_is_a_key_with_params', { key: 'value', key2: 'value2' })
      .subscribe((val) => (this.translatedWithParamsValue = val));
  }

  onChangeParams() {
    this.changingParamValue = 'new value';
  }

  ngOnDestroy(): void {
    this.translatedWithoutParamsValueSubscription.unsubscribe();
    this.translatedWithDefaultValueSubscription.unsubscribe();
    this.translatedWithParamsValueSubscription.unsubscribe();
  }
}
