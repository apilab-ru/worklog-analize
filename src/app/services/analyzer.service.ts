import { Injectable } from '@angular/core';
import { ImportLog, Log, LogDetail } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AnalyzerService {
  constructor() {
  }

  convertLogs(list: ImportLog[]): Log[] {
    return list.map((res) => ({
      issue: res[0],
      comment: res[1],
      time: Math.round(parseFloat(res[2]) * 60),
    }))
  }

  saveLogs(list: ImportLog[]): void {
    localStorage.setItem('a-logs-imports', JSON.stringify(list));
  }

  getLogs(): ImportLog[] {
    const cache = localStorage.getItem('a-logs-imports');
    if (cache) {
      return JSON.parse(cache);
    }

    return [];
  }

  groupLogs(list: Log[]): LogDetail[] {
    const mapLogs = list.reduce((prev, item) => {
      const key = this.getKey(item);
      return {
        ...prev,
        [key]: {
          ...item,
          // @ts-ignore
          time: (prev[key] ? prev[key].time : 0) + item.time,
          // @ts-ignore
          deps: (prev[key] ? [...prev[key].deps, item] : []),
          key,
        }
      }
    }, {});

    const listResult = [];
    for(let i in mapLogs) {
      // @ts-ignore
      listResult.push(mapLogs[i]);
    }

    return listResult;
  }

  private getKey(item: Log): string {
    if (item.issue.includes('ADULT-1818')) {
      return 'ADULT-1818';
    }

    const comment = item.comment.toLowerCase().trim();

    if (comment.includes('techreview')) {
      return 'techreview';
    }

    if (comment.includes('кандидат')) {
      return 'кандидат';
    }

    if (comment.includes('codereview')) {
      return 'codereview';
    }

    if (comment.includes('груминг')) {
      return 'груминг';
    }

    if (comment.includes('онбординг')) {
      return 'онбординг';
    }

    if (comment.includes('slack') || comment.includes('chats')) {
      return 'slack';
    }

    if (comment.includes('собес')) {
      return 'собес';
    }

    return comment + '/-/' + item.issue + ' - ';
  }
}
