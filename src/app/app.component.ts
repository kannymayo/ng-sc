import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { debounceTime, Observable } from 'rxjs';
import { EChartsOption } from 'echarts';
import { WeatherDataService, DatasetType } from './weather-data.service';

type ChartType = {
  chartName: string;
  dataset: DatasetType;
  chartType: 'line' | 'bar' | 'area';
  dateRange: {
    start: Date;
    end: Date;
  };
  obs$: Observable<any>;
};

@Pipe({ name: 'toChartData' })
export class ToChartDataPipe implements PipeTransform {
  transform(
    value: readonly [any, any] | null,
    chartType: ChartType['chartType']
  ) {
    if (!value) return null;
    return {
      xAxis: {
        type: 'category' as const,
        data: value[1],
      },
      series: [
        {
          type: chartType === 'area' ? 'line' : chartType,
          data: value[0],
          areaStyle: chartType === 'area' ? {} : undefined,
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
      <a class="hidden sm:flex place-self-stretch items-center" href="/"
        >Dashboard</a
      >
      <mat-tab-group
        class=" min-w-0"
        mat-stretch-tabs="false"
        animationDuration="0"
        color="accent"
        (selectedTabChange)="handleTabChange($event)"
        [(selectedIndex)]="selectedIndex"
      >
        <mat-tab
          labelClass="!h-16 select-none"
          *ngFor="let chart of charts"
          [label]="chart.chartName"
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
      class="from-teal-700 to-indigo-500 h-full bg-gradient-to-br pt-16 custom-grid w-full grid relative"
    >
      <!-- Side Panel Controls. On The Bottom When Mobile  -->
      <aside
        class="sm:bg-slate-100/50 bg-slate-300 sm:border-0 border-t-2 border-slate-600 z-10 sm:z-0 sm:static absolute left-0 right-0 bottom-0 h-48 sm:h-auto px-1 py-4 overflow-x-hidden overflow-y-auto xl:px-4"
      >
        <form
          [formGroup]="form"
          class="sm:flex-col flex-wrap flex sm:flex-nowrap gap-y-2"
        >
          <!-- Chart Name -->
          <mat-form-field class="w-full">
            <mat-label>Chart Name</mat-label>
            <input
              matInput
              placeholder="Ex. Pizza"
              formControlName="chartName"
              name="chartName"
            />
          </mat-form-field>

          <!-- Dataset -->
          <mat-form-field class="w-full" appearance="fill">
            <mat-label>Dataset</mat-label>
            <mat-select
              formControlName="dataset"
              [compareWith]="optionsIdentityFn"
            >
              <mat-option
                *ngFor="let dataset of datasets"
                [value]="dataset.value"
              >
                {{ dataset.viewValue }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Chart Types -->
          <mat-form-field class="w-full" appearance="fill">
            <mat-label>Chart Type</mat-label>
            <mat-select formControlName="chartType" name="chartType">
              <mat-option *ngFor="let ct of chartTypes" [value]="ct.value">
                {{ ct.viewValue }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Date Range -->
          <mat-form-field class="w-full" appearance="fill">
            <mat-label>Enter a date range</mat-label>
            <mat-date-range-input
              formGroupName="dateRange"
              [rangePicker]="picker"
            >
              <!-- Inputs for range start & end -->
              <input
                matStartDate
                formControlName="start"
                placeholder="Start date"
              />
              <input matEndDate formControlName="end" placeholder="End date" />
            </mat-date-range-input>
            <mat-hint>MM/DD/YYYY – MM/DD/YYYY</mat-hint>

            <!-- Picker -->
            <mat-datepicker-toggle
              matIconSuffix
              [for]="picker"
            ></mat-datepicker-toggle>
            <mat-date-range-picker #picker></mat-date-range-picker>

            <!-- Error -->
            <mat-error
              *ngIf="
                form.controls['dateRange']
                  .get('start')
                  ?.hasError('matStartDateInvalid')
              "
              >Invalid start date</mat-error
            >
            <mat-error
              *ngIf="
                form.controls['dateRange']
                  .get('end')
                  ?.hasError('matEndDateInvalid')
              "
              >Invalid end date</mat-error
            >
          </mat-form-field>
        </form>
      </aside>

      <main class="relative">
        <!-- Floated Tab Content -->
        <div
          class="absolute inset-0 lg:inset-3 xl:left-10 xl:right-10 transition-all duration-300 delay-200 lg:rounded-sm bg-white grid custom-grid-verticle mb-48 sm:mb-0 overflow-hidden"
        >
          <!-- Header -->
          <div
            class="gap-2 min-h-0 min-w-0 bg-slate-100 flex justify-between items-center py-1"
          >
            <div class="flex gap-2 truncate items-center ml-4">
              <span class="text-xl">{{ charts[selectedIndex].chartName }}</span>
              <mat-chip-listbox>
                <mat-chip class="capitalize">
                  {{ charts[selectedIndex].dataset.granularity }}
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
              [merge]="
                charts[selectedIndex].obs$
                  | async
                  | toChartData : form.value.chartType
              "
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
          grid-template-columns: 250px 1fr;
        }
      }

      @media (min-width: 1280px) {
        .custom-grid {
          grid-template-columns: 320px 1fr;
        }
      }

      .custom-grid-verticle {
        grid-template-rows: auto 1fr;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  selectedIndex = 0;
  // charts store client and server meta data
  charts: ChartType[] = [];
  form: FormGroup = this.fb.group({
    chartName: ['', Validators.required],
    dataset: ['', Validators.required],
    chartType: ['', Validators.required],
    dateRange: this.fb.group({
      start: [null, Validators.required],
      end: [null, Validators.required],
    }),
  });

  datasets = [
    {
      value: {
        granularity: 'hourly',
        id: 'relativehumidity_2m',
      },
      viewValue: 'Relative Humidity',
    },
    {
      value: {
        granularity: 'daily',
        id: 'temperature_2m_max',
      },
      viewValue: 'Max Temperature',
    },
    {
      value: {
        granularity: 'daily',
        id: 'temperature_2m_min',
      },
      viewValue: 'Min Temperature',
    },
    {
      value: {
        granularity: 'hourly',
        id: 'direct_radiation',
      },
      viewValue: 'Direct Radiation',
    },
  ];
  chartTypes = [
    { value: 'line', viewValue: 'Line' },
    { value: 'bar', viewValue: 'Bar' },
    { value: 'area', viewValue: 'Area' },
  ];
  granularities = [
    { value: 'daily', viewValue: 'Day' },
    { value: 'hourly', viewValue: 'Hour' },
  ];

  chartOption: EChartsOption = {
    xAxis: { data: [] },
    yAxis: {},
    series: [],
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 10, bottom: 30 },
  };

  constructor(
    private weatherDataService: WeatherDataService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.addChart('Relative Humidity', 'relativehumidity_2m', 'hourly', 'bar');
    this.addChart('Max Temperature', 'temperature_2m_max', 'daily', 'line');
    this.addChart('Min Temperature', 'temperature_2m_min', 'daily', 'line');
    this.addChart('Direct Radiation', 'direct_radiation', 'hourly', 'area');
    this.form.valueChanges.pipe(debounceTime(100)).subscribe((value) => {
      this.updateCharts();
    });
  }

  addChart(
    chartName: string,
    id: DatasetType['id'],
    granularity: DatasetType['granularity'],
    chartType: ChartType['chartType'] = 'line',
    start: Date = new Date(2023, 0, 1),
    end: Date = new Date(2023, 0, 10)
  ) {
    this.charts.push({
      chartName,
      dataset: { id, granularity },
      chartType,
      dateRange: { start, end },
      obs$: this.weatherDataService.getDataset(
        { id, granularity },
        { start, end }
      ),
    });
    this.selectChart(this.charts.length - 1);
  }

  // [data flow] from chart to form [one-off]
  selectChart(index: number) {
    this.selectedIndex = index;
    const curChart = this.charts[index];

    this.form.patchValue({
      chartName: curChart.chartName,
      dataset: curChart.dataset,
      chartType: curChart.chartType,
      dateRange: {
        start: curChart.dateRange.start,
        end: curChart.dateRange.end,
      },
    });
  }
  // [data flow] from form to chart, and data service? [reactive]
  updateCharts() {
    const curChart = this.charts[this.selectedIndex];
    const formState = this.form.value;
    // full data persisted into chart
    curChart.chartName = formState.chartName;
    curChart.dataset = formState.dataset;
    curChart.chartType = formState.chartType;
    if (formState.dateRange.start && formState.dateRange.end) {
      // had to do this sync until data service can handle independent date
      // range
      this.charts.forEach((chart) => {
        chart.dateRange = {
          start: formState.dateRange.start,
          end: formState.dateRange.end,
        };
      });
    }
    // server data goes to service
    if (formState.dateRange.start && formState.dateRange.end) {
      curChart.obs$ = this.weatherDataService.getDataset(
        {
          id: formState.dataset.id,
          granularity: curChart.dataset.granularity,
        },
        {
          start: this.form.value.dateRange.start,
          end: this.form.value.dateRange.end,
        }
      );
    }
  }

  deleteChart(index: number) {
    this.charts.splice(index, 1);
    this.selectChart(this.selectedIndex === 0 ? 0 : this.selectedIndex - 1);
  }

  handleTabChange(e: any) {
    this.selectChart(e.index);
  }

  optionsIdentityFn = (a: any, b: any) => a.id === b.id;
}
