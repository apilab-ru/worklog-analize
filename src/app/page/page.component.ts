import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnalyzerService } from '../services/analyzer.service';
import { Observable, combineLatest } from 'rxjs';
import { GroupedLog, LogDetail, TotalCalc } from '../interfaces';
import { map, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageComponent implements OnInit {
  workLogControl = new FormControl();
  groupByIssueControl = new FormControl(false);

  logs$: Observable<LogDetail[]>;
  boardData$: Observable<TotalCalc>;

  constructor(
    private analyzerService: AnalyzerService,
  ) {
    this.logs$ = this.workLogControl.valueChanges.pipe(
      map(value => JSON.parse(value)),
      tap(logs => this.analyzerService.saveLogs(logs)),
      startWith(this.analyzerService.getLogs()),
      map(list => this.analyzerService.convertLogs(list)),
      map(list => this.analyzerService.groupLogs(list)),
    );

    this.boardData$ = combineLatest([
      this.groupByIssueControl.valueChanges.pipe(startWith(this.groupByIssueControl.value)),
      this.logs$,
    ]).pipe(
      map(([groupByIssue, logs]) => this.boardGroup(logs, groupByIssue))
    );
  }

  ngOnInit(): void {

  }

  boardGroup(list: LogDetail[] | null, groupByIssue: boolean): TotalCalc {
    if (!list) {
      return { time: 0, logs: [] };
    }

    const mapLogs: { [key: string]: GroupedLog } = list.reduce((prev, item) => {
      const key = groupByIssue ? item.issue.split(' -')[0] : item.key;

      // @ts-ignore
      const prevItem = prev[key] as GroupedLog | undefined;

      return {
        ...prev,
        [key]: {
          issue: item.issue,
          logs: (prevItem ? [...prevItem.logs, item] : [item]),
          time: (prevItem ? prevItem.time : 0) + item.time,
          key: key.split('/-/')[0],
        },
      };
    }, {});

    const resultList = [];
    for (let i in mapLogs) {
      resultList.push(mapLogs[i]);
    }

    const time = resultList.reduce((prev, item) => prev + item.time, 0);

    return {
      time,
      logs: resultList.map(item => ({
        ...item,
        percent: item.time / time * 100,
      })).sort((a, b) => b.percent - a.percent),
    };
  }

}
