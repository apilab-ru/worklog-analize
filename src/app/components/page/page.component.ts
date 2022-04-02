import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AnalyzerService } from '../../services/analyzer.service';
import { combineLatest, Observable, of } from 'rxjs';
import { GroupConfig, Log, LogDetail, Rule } from '../../interfaces';
import { catchError, map } from 'rxjs/operators';
import { makeStore } from "../../services/store";
import { MatSnackBar } from "@angular/material/snack-bar";

const INITIAL_STATE = {
  logs: [] as Log[],
  groupConfig: {
    groupByComment: true,
    groupByTask: true,
    groupByRules: false,
  } as GroupConfig,
  rules: [] as Rule[],
};

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageComponent implements OnInit {
  logs$: Observable<LogDetail[]>;

  private store = makeStore(INITIAL_STATE);

  constructor(
    private analyzerService: AnalyzerService,
    private snackBar: MatSnackBar
  ) {
  }

  updateField<Field extends keyof typeof INITIAL_STATE>(field: Field, value: typeof INITIAL_STATE[Field]): void {
    // @ts-ignore
    this.store[field].next(value);
  }

  ngOnInit(): void {
    this.store.logs.subscribe(logs => console.log('xxx logs', logs))

    this.logs$ = combineLatest([
      this.store.logs,
      this.store.rules,
      this.store.groupConfig,
    ]).pipe(
      map(([logs, rules, groupConfig]) => this.analyzerService.groupLogs(logs, rules, groupConfig)),
      catchError(error => {
        this.snackBar.open(error.toString());
        console.error(error);

        return of([]);
      })
    );

    this.logs$.subscribe(logs => console.log('xxx logs', logs))
  }
}
