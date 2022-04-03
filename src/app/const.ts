import { LogsUserRawData } from "./interfaces";

const DEFAULT_LOGS = [
  ['TECH-1', 'codereview', '1'],
  ['COM-1 - meetings', 'daily', '0.5'],
  ['COM-1 - meetings', 'daily', '0.5'],
  ['Task-1', 'frontend', '2'],
  ['Task-1', 'backend', '2'],
  ['COM-1 - meetings', 'daily', '0.5'],
  ['COM-1 - meetings', 'daily', '0.5'],
  ['COM-1 - meetings', 'daily', '0.5'],
  ['Task-2', 'frontend', '2'],
  ['COM-1 - meetings', 'daily', '0.5'],
  ['Task-3', 'frontend', '2'],
  ['TECH-1', 'codereview', '1'],
  ['COM-1 - meetings', 'daily', '0.5'],
  ['COM-1 - meetings', 'daily', '0.5'],
  ['Task-5', 'frontend', '2'],
];

export const DEFAULT_DATA: LogsUserRawData = {
  logs: JSON.stringify(DEFAULT_LOGS),
  groupConfig: {
    groupByComment: false,
    groupByTask: false,
    groupByRules: true,
  },
  rules:
`includes|comment:1x1,daily,meeting|meets
includes|comment:techreview|techreivew
includes|comment:codereview|codereivew`,
}
