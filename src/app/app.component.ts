import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { EChartsOption } from 'echarts';
import { WeatherDataService } from './weather-data.service';

@Pipe({ name: 'toChartData' })
export class ToChartDataPipe implements PipeTransform {
  transform(value: readonly [any, any] | null, ...args: any[]) {
    if (!value) return null;
    return {
      xAxis: {
        type: 'category' as const,
        data: value[1],
      },
      series: [
        {
          type: 'line' as const,
          data: value[0],
        },
      ],
    };
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

    <div class="from-teal-700 to-indigo-500 h-full bg-gradient-to-tl pt-16 ">
      <main
        class="bg-white max-w-screen-lg  box-border h-full mx-auto flex flex-col"
      >
        <div class="justify-center flex p-2"><h1 class="">Title</h1></div>
        <div class="overflow-hidden flex-1">
          <div
            class="h-full"
            echarts
            [options]="chartOption"
            [merge]="relativeHumidity$ | async | toChartData"
          ></div>
        </div>
      </main>
    </div>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  chartOption: EChartsOption = {
    xAxis: {
      data: [],
    },
    yAxis: {},
    series: [
      {
        type: 'bar',
        // name: 'Sales',
        // data: [],
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: 50,
      right: 10,
      bottom: 30,
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
