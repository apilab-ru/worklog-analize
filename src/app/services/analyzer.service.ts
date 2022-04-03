import { Injectable } from '@angular/core';
import { GroupConfig, GroupedLog, ImportLog, Log, LogDetail, Rule } from '../interfaces';

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
      const finalKey = name || key;

      return {
        ...prev,
        [finalKey]: {
          ...item,
          // @ts-ignore
          time: (prev[finalKey] ? prev[finalKey].time : 0) + item.time,
          // @ts-ignore
          deps: (prev[finalKey] ? [...prev[finalKey].deps, item] : [item]),
          key: finalKey,
          name
        }
      }
    }, {});

    const result = Object.values(mapLogs) as LogDetail[];
    result.sort((a, b) => b.time - a.time)
    return result;
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

  private getKey(item: Log, rules: Rule[], groupConfig: GroupConfig): { key: string, name?: string } {
    let key = '';
    const comment = item.comment.toLowerCase().trim();

    if (groupConfig.groupByTask) {
      key += item.issue;
    }

    if (groupConfig.groupByComment) {
      key += comment;
    }

    let name = undefined;
    if (groupConfig.groupByRules) {
      for(let i in rules) {
        const rule = rules[i];

        // includes
        const field = rule.field === 'comment' ? comment : (item[rule.field] as string);
        if (rule.values.some(value => field.includes(value))) {
          key += rule.key;
          name = rule.name ? rule.name.trim() : undefined;
          break;
        }
      }
    }

    return {
      key: key || 'develop',
      name,
    };
  }

  private typeFilter(it: Rule | null): it is Rule {
    return !!it;
  }
}
