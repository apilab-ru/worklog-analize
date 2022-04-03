import { Injectable } from '@angular/core';
import { GroupConfig, ImportLog, LogsUserRawData } from "../interfaces";
import { makeStore, RecordSubject } from "./store";
import { Observable } from "rxjs";
import { map, shareReplay } from 'rxjs/operators';
import { DEFAULT_DATA } from "../const";

const STORAGE_KEY = 'workLogAnalyzeForm-v2';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private store: RecordSubject<LogsUserRawData>;

  logs$: Observable<ImportLog[]>;
  groupConfig$: Observable<GroupConfig>;
  rules$: Observable<string[]>;

  constructor() {
    this.store = makeStore(this.loadData());

    this.logs$ = this.store.logs.asObservable().pipe(
      map(logs => JSON.parse(logs)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
    this.groupConfig$ = this.store.groupConfig.asObservable();
    this.rules$ = this.store.rules.asObservable().pipe(
      map(rulesStr => this.decodeRules(rulesStr)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  saveData(data: LogsUserRawData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    this.store.update(data);
  }

  loadData(): LogsUserRawData {
    const formData = localStorage.getItem(STORAGE_KEY);

    if (formData) {
      return JSON.parse(formData);
    }

    return DEFAULT_DATA;
  }

  private decodeRules(rules: string | null): string[] {
    if (!rules) {
      return [];
    }

    return rules.split('\n');
  }
}
