import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  map,
  switchMap,
  distinct,
  scan,
  filter,
  shareReplay,
  debounceTime,
} from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs';

type DatasetType = {
  name:
    | 'relativehumidity_2m'
    | 'direct_radiation'
    | 'temperature_2m_max'
    | 'temperature_2m_min';
  interval: 'hourly' | 'daily';
};

@Injectable({
  providedIn: 'root',
})
export class WeatherDataService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';
  private store$: Observable<any>;

  private dataset$ = new ReplaySubject<DatasetType | undefined>(undefined);
  private datasets$ = this.dataset$.pipe(
    filter(Boolean),
    distinct((item) => `${item.name}-${item.interval}`),
    scan((acc, item) => [...acc, item], [] as DatasetType[]),
    // even 0ms is enough as initial queries are pushed synchronously?
    debounceTime(0)
  );

  constructor(private http: HttpClient) {
    this.addDataset({ name: 'temperature_2m_max', interval: 'daily' });
    this.addDataset({ name: 'temperature_2m_min', interval: 'daily' });

    this.store$ = this.datasets$.pipe(
      switchMap((datasets) => {
        const params = new HttpParams()
          .set(
            'hourly',
            datasets
              .filter((item) => item.interval === 'hourly')
              .map((item) => item.name)
              .join(',')
          )
          .set(
            'daily',
            datasets
              .filter((item) => item.interval === 'daily')
              .map((item) => item.name)
              .join(',')
          )
          .set('latitude', '1.29')
          .set('longitude', '103.85')
          .set('timezone', 'Asia/Singapore')
          .set('start_date', '2023-01-01')
          .set('end_date', '2023-01-10');
        return this.http.get(this.baseUrl, { params });
      }),
      shareReplay(1)
    );
  }

  private addDataset(dataset: DatasetType) {
    this.dataset$.next(dataset);
  }

  getDataset({ name, interval }: DatasetType) {
    this.addDataset({ name, interval });
    return this.store$.pipe(
      map((data) => {
        return [data?.[interval]?.[name], data?.[interval]?.time];
      })
    );
  }
}
