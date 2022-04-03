import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface StoreMethods<T> {
  select: () => Observable<T>
  update: (data: Partial<T>) => void,
  get: () => T,
}

type StoreFields<T> = { [key in keyof T]: BehaviorSubject<T[key]> };
export type RecordSubject<T> = StoreFields<T> & StoreMethods<T>;

export function makeStore<T>(data: T): RecordSubject<T> {
  const store = {} as StoreFields<T>;
  for (let key in data) {
    // @ts-ignore
    store[key] = new BehaviorSubject<typeof data[typeof key]>(data[key]);
  }
  const keys = Object.keys(data) as (keyof T)[];

  const subjects: Observable<any>[] = [];
  Object.values(store).forEach((subject, index) => {
    subjects.push((subject as BehaviorSubject<any>).pipe(
      // @ts-ignore
      startWith(data[keys[index]])
    ))
  });

  // @ts-ignore
  (store as RecordSubject<T>).select = () => combineLatest(subjects).pipe(
    map((list) => {
      return keys.reduce((obj, key, index) => {
        // @ts-ignore
        obj[key] = list[index];
        return obj;
      }, {}) as T;
    }),
    startWith(data),
  );

  (store as RecordSubject<T>).get = () => {
    return keys.reduce((prev, key) => ({
      ...prev,
      [key]: store[key].getValue(),
    }), {}) as T;
  }

  (store as RecordSubject<T>).update = (data) => {
    Object.entries(data).forEach(([key, value]) => {
      // @ts-ignore
      store[key].next(value);
    })
  }

  return store as RecordSubject<T>;
}
