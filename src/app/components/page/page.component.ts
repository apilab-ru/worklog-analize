import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AnalyzerService } from '../../services/analyzer.service';
import { combineLatest, Observable, of } from 'rxjs';
import { LogDetail } from '../../interfaces';
import { catchError, map } from 'rxjs/operators';
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserDataService } from "../../services/user-data.service";

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageComponent implements OnInit {
  logs$: Observable<LogDetail[]>;

  constructor(
    private analyzerService: AnalyzerService,
    private snackBar: MatSnackBar,
    private userDataService: UserDataService,
  ) {
  }

  ngOnInit(): void {
    const logs$ = this.userDataService.logs$.pipe(
      map(logs => this.analyzerService.convertLogs(logs)),
      catchError((error) => {
        this.snackBar.open(error.toString());
        console.error(error);
        return of([]);
      })
    );

    const rules$ = this.userDataService.rules$.pipe(
      map(rules => this.analyzerService.parserRules(rules)),
      catchError((error) => {
        this.snackBar.open(error.toString());
        console.error(error);
        return of([]);
      })
    );

    this.logs$ = combineLatest([
      logs$,
      rules$,
      this.userDataService.groupConfig$,
    ]).pipe(
      map(([logs, rules, groupConfig]) => this.analyzerService.groupLogs(logs, rules, groupConfig)),
      catchError(error => {
        this.snackBar.open(error.toString());
        console.error(error);

        return of([]);
      })
    );
  }
}
