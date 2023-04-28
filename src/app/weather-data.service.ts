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

export type DatasetType = {
  id:
    | 'relativehumidity_2m'
    | 'direct_radiation'
    | 'temperature_2m_max'
    | 'temperature_2m_min';
  granularity: 'hourly' | 'daily';
};

type StreamInput = [
  DatasetType,
  {
    dateStartStr: string;
    dateEndStr: string;
  }
];

@Injectable({
  providedIn: 'root',
})
export class WeatherDataService {
  private baseUrl = 'https://api.open-meteo.com/v1/forecast';
  private store$: Observable<any>;
  private dataset$ = new ReplaySubject<StreamInput | undefined>(undefined);
  private datasets$ = this.dataset$.pipe(
    filter(Boolean),
    distinct(([{ id, granularity }, { dateStartStr, dateEndStr }]) =>
      [id, granularity, dateStartStr, dateEndStr].join('-')
    ),
    scan((acc, item) => [...acc, item], [] as StreamInput[]),
    // even 0ms is enough as initial queries are pushed synchronously?
    debounceTime(0)
  );

  constructor(private http: HttpClient) {
    this.store$ = this.datasets$.pipe(
      switchMap((reqBlueprints) => {
        const params = this.formParamsFromReqBlueprints(reqBlueprints);
        return this.http.get(this.baseUrl, { params });
      }),
      shareReplay(1)
    );
  }

  private addDataset(
    dataset: DatasetType,
    {
      start,
      end,
    }: {
      start: Date;
      end: Date;
    }
  ) {
    const dateStartStr = start.toISOString().slice(0, 10);
    const dateEndStr = end.toISOString().slice(0, 10);
    this.dataset$.next([dataset, { dateStartStr, dateEndStr }]);
  }

  getDataset(
    { id, granularity }: DatasetType,
    dateRange = {
      start: new Date('2023-01-01'),
      end: new Date('2023-01-10'),
    }
  ) {
    this.addDataset({ id, granularity }, dateRange);
    return this.store$.pipe(
      map((data) => {
        return [data?.[granularity]?.[id], data?.[granularity]?.time] as const;
      })
    );
  }

  private formParamsFromReqBlueprints(reqBlueprints: StreamInput[]) {
    /*
        Will need to stop assuming we take the lastest date range, if we want to
        make an auto growing cache.

        But caching for multiple charts with different date ranges, while still
        minimizing requests, is a hard problem. Basically turning REST into
        GraphQL.
        */
    const dateStartStr =
      reqBlueprints[reqBlueprints.length - 1][1].dateStartStr;
    const dateEndStr = reqBlueprints[reqBlueprints.length - 1][1].dateEndStr;
    // let minDate = new Date('9999-12-31');
    // let maxDate = new Date('0000-01-01');
    // reqBlueprints.forEach(([, { dateStartStr, dateEndStr }]) => {
    //   const dateStart = new Date(dateStartStr);
    //   const dateEnd = new Date(dateEndStr);
    //   if (dateStart < minDate) {
    //     minDate = dateStart;
    //   }
    //   if (dateEnd > maxDate) {
    //     maxDate = dateEnd;
    //   }
    // });
    // const dateStartStr = minDate.toISOString().slice(0, 10);
    // const dateEndStr = maxDate.toISOString().slice(0, 10);

    const params = new HttpParams()
      .set(
        'hourly',
        reqBlueprints
          .filter(([dataset]) => dataset.granularity === 'hourly')
          .map(([dataset]) => dataset.id)
          .join(',')
      )
      .set(
        'daily',
        reqBlueprints
          .filter(([dataset]) => dataset.granularity === 'daily')
          .map(([dataset]) => dataset.id)
          .join(',')
      )
      .set('latitude', '1.29')
      .set('longitude', '103.85')
      .set('timezone', 'Asia/Singapore')
      .set('start_date', dateStartStr)
      .set('end_date', dateEndStr);

    return params;
  }
}
