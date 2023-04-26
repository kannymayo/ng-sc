import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { WeatherDataService } from './weather-data.service';

@Pipe({ name: 'toChartSeries' })
export class ToChartSeriesPipe implements PipeTransform {
  transform(value: string[][] | null, ...args: any[]) {
    console.count('pipe run');
    if (!value) {
      return [
        {
          data: [],
        },
      ];
    } else {
      return [
        {
          data: value[0].map((dataValue, i: number) => {
            return {
              x: value[1][i],
              y: dataValue,
            };
          }),
        },
      ];
    }
  }
}

@Component({
  selector: 'app-root',
  template: `
    <!-- Header -->
    <div
      class="fixed top-0 left-0 right-0 h-16 shadow-lg bg-white text-lg pl-8 flex items-center"
    >
      <span>Dashboard</span>
      <mat-tab-group
        class=" min-w-0"
        mat-stretch-tabs="false"
        animationDuration="0"
      >
        <mat-tab
          labelClass="!h-16"
          *ngFor="let tab of 'aaaaaaaaaaaaaaaa'.split('')"
          [label]="tab"
        ></mat-tab>
      </mat-tab-group>
    </div>

    <div class="from-teal-700 to-indigo-500 h-full bg-gradient-to-tl pt-16">
      <div class="bg-white max-w-screen-lg mx-auto h-full grid">
        <div class="justify-center flex p-2"><h1 class="">Title</h1></div>
        <div class="overflow-hidden mx-1 sm:mx-4">
          <apx-chart
            [series]="relativeHumidity$ | async | toChartSeries"
            [chart]="{ type: 'line' }"
            [stroke]="{ curve: 'smooth', width: 2 }"
          ></apx-chart>
        </div>
      </div>
    </div>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  options = {
    maintainAspectRatio: false,
    resizeDelay: 200,
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          callback: function (value: any, index: any, values: any) {
            return (this as any).getLabelForValue(index);
          },
        },
      },
    },
  };
  relativeHumidity$ = this.weatherDataService.getDataset({
    name: 'relativehumidity_2m',
    interval: 'hourly',
  });

  constructor(private weatherDataService: WeatherDataService) {}

  ngOnChanges(changes: any) {
    console.log(changes);
  }

  ngOnInit() {
    this.weatherDataService.getDataset({
      name: 'relativehumidity_2m',
      interval: 'hourly',
    });

    this.weatherDataService
      .getDataset({
        name: 'direct_radiation',
        interval: 'hourly',
      })
      .subscribe((data) => {
        console.log('direct radiation', data);
      });
  }

  handleResub() {
    this.weatherDataService
      .getDataset({
        name: 'direct_radiation',
        interval: 'hourly',
      })
      .subscribe((data) => {
        console.log(data);
      });
  }
}
