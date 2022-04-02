import { Injectable } from '@angular/core';
import { GroupConfig, GroupedLog, ImportLog, Log, LogDetail, Rule, TotalCalc } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AnalyzerService {
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

  groupLogs(list: Log[], rules: Rule[], groupConfig: GroupConfig): LogDetail[] {
    const mapLogs = list.reduce((prev, item) => {
      const { key, name } = this.getKey(item, rules, groupConfig);
      return {
        ...prev,
        [key]: {
          ...item,
          // @ts-ignore
          time: (prev[key] ? prev[key].time : 0) + item.time,
          // @ts-ignore
          deps: (prev[key] ? [...prev[key].deps, item] : [item]),
          key,
          name
        }
      }
    }, {});

    const result = Object.values(mapLogs) as LogDetail[];
    result.sort((a, b) => b.time - a.time)
    return result;
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

  private getKey(item: Log, rules: Rule[], groupConfig: GroupConfig): { key: string, name?: string } {
    let key = '';
    const comment = item.comment.toLowerCase().trim();

    if (groupConfig.groupByTask) {
      key += item.issue;
    }

    if (groupConfig.groupByComment) {
      key += comment;
    }

    let name;
    if (groupConfig.groupByRules) {
      for(let i in rules) {
        const rule = rules[i];

        // includes
        const field = rule.field === 'comment' ? comment : (item[rule.field] as string);
        if (rule.values.some(value => field.includes(value))) {
          key += rule.key;
          name = rule.name;
          break;
        }
      }
    }

    return {
      key: key || 'develop',
      name,
    };
  }

  parserRules(rawRules: string[]): Rule[] {
    return rawRules.map(item => {
      const [action, other, name] = item.split('|');

      if (!other) {
        return null;
      }

      const [field, value] = other.split(':');
      const values = value?.split(',');

      if (!values) {
        return null;
      }

      return {
        action,
        field,
        values,
        key: value,
        name
      } as Rule
    }).filter(this.typeFilter)
  }

  private typeFilter(it: Rule | null): it is Rule {
    return !!it;
  }
}
