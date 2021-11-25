import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { AnalyzerService } from '../services/analyzer.service';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { GroupedLog, LogDetail, TotalCalc } from '../interfaces';
import { map, startWith } from 'rxjs/operators';

const STORAGE_KEY = 'workLogAnalyzeForm';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageComponent implements OnInit {
  formGroup = new FormGroup({
    workLogControl: new FormControl(),
    groupByIssueControl: new FormControl(false),
    skipGroupByTask: new FormControl(false),
    rules: new FormControl(),
  })

  logs$: Observable<LogDetail[]> | undefined;
  boardData$: Observable<TotalCalc> | undefined;
  openedItem$ = new BehaviorSubject<string | null>(null);

  constructor(
    private analyzerService: AnalyzerService,
  ) {
  }

  ngOnInit(): void {
    this.formGroup.valueChanges.subscribe(form => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    });

    const formData = localStorage.getItem(STORAGE_KEY);
    if (formData) {
      this.formGroup.patchValue(JSON.parse(formData), { emitEvent: true });
    }

    const rawLogs$ = this.getControlChanges('workLogControl').pipe(
      map(value => JSON.parse(value)),
      map(logs => this.analyzerService.convertLogs(logs)),
    )

    this.logs$ = combineLatest([
      rawLogs$,
      this.getControlChanges('rules'),
      this.getControlChanges('skipGroupByTask'),
    ]).pipe(
      map(([logs, rules, skipGroupByTask ]) => this.analyzerService.groupLogs(logs, this.decodeRules(rules), !!skipGroupByTask)),
    );

    this.boardData$ = combineLatest([
      this.getControlChanges('groupByIssueControl'),
      this.logs$,
    ]).pipe(
      map(([groupByIssue, logs]) => this.analyzerService.boardGroup(logs, !!groupByIssue))
    );
  }

  toggleItem(key: string): void {
    if (this.openedItem$.getValue() === key) {
      return this.openedItem$.next(null);
    }

    this.openedItem$.next(key);
  }

  private decodeRules(rules: string | null): string[] {
    if (!rules) {
      return [];
    }

    return rules.split('\n');
  }

  private getControl(name: string): AbstractControl {
    return this.formGroup.get(name)!;
  }

  private getControlChanges(name: string): Observable<string> {
    return this.getControl(name).valueChanges.pipe(startWith(this.getControl(name).value));
  }
}
