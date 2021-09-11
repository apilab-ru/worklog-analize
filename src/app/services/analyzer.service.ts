import { Injectable } from '@angular/core';
import { GroupedLog, ImportLog, Log, LogDetail, Rule, TotalCalc } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AnalyzerService {
  constructor() {
  }

  convertLogs(list: ImportLog[]): Log[] {
    if (!list) {
      return [];
    }

    return list.map((res) => ({
      issue: res[0],
      comment: res[1],
      time: Math.round(parseFloat(res[2]) * 60),
    }))
  }

  groupLogs(list: Log[], rawRules: string[]): LogDetail[] {
    const mapLogs = list.reduce((prev, item) => {
      const key = this.getKey(item, this.parserRules(rawRules));
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
          logs: (prevItem ? [...prevItem.logs, item] : (groupByIssue ? [item] : [...item.deps, item])),
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

  private getKey(item: Log, rules: Rule[]): string {
    const comment = item.comment.toLowerCase().trim();

    let key;
    for(let i in rules) {
      const rule = rules[i];

      // includes
      const field = rule.field === 'comment' ? comment : (item[rule.field] as string);
      if (rule.values.some(value => field.includes(value))) {
        key = rule.key;
        break;
      }
    }

    if (key) {
      return key;
    }

    return comment + '/-/' + item.issue + ' - ';
  }

  private parserRules(rawRules: string[]): Rule[] {
    return rawRules.map(item => {
      const [action, other] = item.split('|');
      const [field, value] = other.split(':');
      const values = value.split(',');

      return {
        action,
        field,
        values,
        key: value
      } as Rule
    })
  }
}
