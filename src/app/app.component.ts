import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { EChartsOption } from 'echarts';
import { WeatherDataService, DatasetType } from './weather-data.service';

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
      class="fixed top-0 left-0 right-0 h-16 shadow-lg bg-white text-lg pl-8 flex items-center z-10 gap-4"
    >
      <span>Dashboard</span>
      <mat-tab-group
        class=" min-w-0"
        mat-stretch-tabs="false"
        animationDuration="0"
        color="accent"
        [(selectedIndex)]="selectedIndex"
      >
        <mat-tab
          labelClass="!h-16"
          *ngFor="let chart of charts"
          [label]="chart.displayName"
        ></mat-tab>
      </mat-tab-group>
      <div class=" place-self-stretch flex items-center pr-1">
        <button
          mat-stroked-button
          color="primary"
          class="bg-white text-black"
          (click)="addChart('temperature_2m_max', 'daily')"
        >
          Plus
        </button>
      </div>
    </div>

    <div
      class="from-teal-700 to-indigo-500 h-full bg-gradient-to-tl pt-16 custom-grid w-full grid relative"
    >
      <aside
        class="bg-slate-100/50 z-10 sm:z-0 grid sm:block sm:static absolute left-0 right-0 bottom-0 h-32 sm:h-auto px-1 py-4"
      >
        Side
      </aside>

      <main class=" relative">
        <!-- Floated Section -->
        <div
          class="absolute inset-0 lg:inset-4 xl:left-16 xl:right-16 transition-all duration-300 delay-200 lg:rounded-sm bg-white grid custom-grid-verticle pb-32 sm:pb-0"
        >
          <div
            class="gap-2 min-h-0 min-w-0 p-2 bg-slate-100 flex justify-between items-center"
          >
            <span class="text-xl">{{ charts[selectedIndex].displayName }}</span>
            <button
              mat-icon-button
              color="primary"
              aria-label="Example icon button with a delete icon"
              [disabled]="charts.length === 1"
              (click)="deleteChart(selectedIndex)"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          <div class="overflow-hidden flex-1">
            <div
              class="h-full"
              echarts
              [options]="chartOption"
              [merge]="charts[selectedIndex].obs$ | async | toChartData"
            ></div>
          </div>
        </div>
      </main>
    </div>

    <router-outlet></router-outlet>
  `,
  styles: [
    `
      @media (min-width: 640px) {
        .custom-grid {
          grid-template-columns: 240px 1fr;
        }
      }
      .custom-grid-verticle {
        grid-template-rows: auto 1fr;
      }
    `,
  ],
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
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: 60,
      right: 10,
      bottom: 30,
    },
  };
  relativeHumidity$ = this.weatherDataService.getDataset({
    name: 'relativehumidity_2m',
    interval: 'hourly',
  });

  selectedIndex = 0;
  charts = [
    {
      displayName: 'Relative Humidity',
      dataset: {
        name: 'relativehumidity_2m',
        interval: 'hourly',
      },
      obs$: this.relativeHumidity$,
    },
  ];

  constructor(private weatherDataService: WeatherDataService) {}

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

  addChart(name: DatasetType['name'], interval: DatasetType['interval']) {
    this.charts.push({
      displayName: 'New Chart',
      dataset: {
        name,
        interval,
      },
      obs$: this.weatherDataService.getDataset({
        name,
        interval,
      }),
    });
  }

  deleteChart(index: number) {
    this.selectedIndex = this.selectedIndex - 1;
    this.charts.splice(index, 1);
  }
}
