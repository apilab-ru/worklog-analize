import { LogDetail } from "../../interfaces";

export interface Item extends LogDetail {
  color: string;
  percent: number;
  hours: number;
}
