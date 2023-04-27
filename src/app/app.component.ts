import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { EChartsOption } from 'echarts';
import { WeatherDataService, DatasetType } from './weather-data.service';
import { FormGroup, FormControl } from '@angular/forms';

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
      class="fixed top-0 left-0 right-0 h-16 shadow-lg bg-white text-lg sm:pl-8 flex items-center z-10 gap-4"
    >
      <span class="hidden sm:block">Dashboard</span>
      <mat-tab-group
        class=" min-w-0"
        mat-stretch-tabs="false"
        animationDuration="0"
        color="accent"
        [(selectedIndex)]="selectedIndex"
      >
        <mat-tab
          labelClass="!h-16 select-none"
          *ngFor="let chart of charts"
          [label]="chart.displayName"
        ></mat-tab>
      </mat-tab-group>
      <div class=" place-self-stretch flex items-center pr-1">
        <button
          mat-stroked-button
          color="primary"
          class="bg-white text-black"
          (click)="addChart('Max Temperature', 'temperature_2m_max', 'daily')"
        >
          New
        </button>
      </div>
    </div>

    <div
      class="from-teal-700 to-indigo-500 h-full bg-gradient-to-tl pt-16 custom-grid w-full grid relative"
    >
      <!-- Side Panel Controls -->
      <aside
        class="bg-slate-100/50 z-10 sm:z-0 flex sm:flex-col flex-wrap sm:flex-nowrap gap-y-4 sm:static absolute left-0 right-0 bottom-0 h-48 sm:h-auto px-1 py-4 overflow-x-hidden overflow-y-auto xl:px-4"
      >
        <!-- Chart Name -->
        <mat-form-field class="w-full">
          <mat-label>Chart Name</mat-label>
          <input
            matInput
            placeholder="Ex. Pizza"
            [(ngModel)]="charts[selectedIndex].displayName"
          />
        </mat-form-field>

        <!-- Date Range -->
        <mat-form-field class="w-full" appearance="fill">
          <mat-label>Enter a date range</mat-label>
          <mat-date-range-input [formGroup]="range" [rangePicker]="picker">
            <input
              matStartDate
              formControlName="start"
              placeholder="Start date"
            />
            <input matEndDate formControlName="end" placeholder="End date" />
          </mat-date-range-input>
          <mat-hint>MM/DD/YYYY – MM/DD/YYYY</mat-hint>
          <mat-datepicker-toggle
            matIconSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-date-range-picker #picker></mat-date-range-picker>

          <mat-error
            *ngIf="range.controls.start.hasError('matStartDateInvalid')"
            >Invalid start date</mat-error
          >
          <mat-error *ngIf="range.controls.end.hasError('matEndDateInvalid')"
            >Invalid end date</mat-error
          >
        </mat-form-field>

        <p>Selected range: {{ range.value | json }}</p>

        <!-- Data Granularity -->
        <div class="flex flex-wrap gap-1 items-center justify-between">
          <span class="text-base py-1">Granularity:</span>
          <mat-button-toggle-group class=" " name="fontStyle">
            <mat-button-toggle value="bold">Day</mat-button-toggle>
            <mat-button-toggle value="italic">Hour</mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </aside>

      <main class=" relative">
        <!-- Floated Tab Content -->
        <div
          class="absolute inset-0 lg:inset-4 xl:left-16 xl:right-16 transition-all duration-300 delay-200 lg:rounded-sm bg-white grid custom-grid-verticle mb-48 sm:mb-0 overflow-hidden"
        >
          <!-- Header -->
          <div
            class="gap-2 min-h-0 min-w-0 bg-slate-100 flex justify-between items-center py-1"
          >
            <div class="flex gap-2 truncate items-center ml-4">
              <span class="text-xl">{{
                charts[selectedIndex].displayName
              }}</span>
              <mat-chip-listbox>
                <mat-chip class="capitalize">
                  {{ charts[selectedIndex].dataset.interval }}
                </mat-chip>
              </mat-chip-listbox>
            </div>
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

          <!-- Chart Container -->
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

      @media (min-width: 1280px) {
        .custom-grid {
          grid-template-columns: 300px 1fr;
        }
      }

      .custom-grid-verticle {
        grid-template-rows: auto 1fr;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
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

  ngOnInit() {}

  addChart(
    displayName: string,
    name: DatasetType['name'],
    interval: DatasetType['interval']
  ) {
    this.charts.push({
      displayName,
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
    this.selectedIndex = this.selectedIndex === 0 ? 0 : this.selectedIndex - 1;
    this.charts.splice(index, 1);
  }
}
