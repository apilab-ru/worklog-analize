export interface Log {
  issue: string;
  comment: string;
  time: number;
}

export interface LogDetail extends Log {
  deps: Log[];
  name?: string;
  key: string;
}

export interface GroupedLog {
  issue: string;
  logs: LogDetail[];
  time: number;
  percent: number;
  key: string;
}

export interface Rule {
  action: 'includes',
  field: keyof Log,
  values: string[],
  key: string;
  name: string;
}

export interface GroupConfig {
  groupByTask: boolean;
  groupByComment: boolean;
  groupByRules: boolean;
}

export interface ImportLog {
 0: string;
 1: string;
 2: string;
}

export interface LogsUserData {
  logs: Log[];
  groupConfig: GroupConfig;
  rules: Rule[];
}

export interface LogsUserRawData {
  logs: string;
  groupConfig: GroupConfig;
  rules: string;
}
