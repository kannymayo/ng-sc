import { Component, OnInit } from '@angular/core';
import { WeatherDataService } from './weather-data.service';

@Component({
  selector: 'app-root',
  template: `
    <!-- Header -->
    <div
      class="fixed top-0 left-0 right-0 h-16 flex items-center bg-blue-600 text-white text-lg gap-4 px-8"
    >
      <span>Dashboard</span>
    </div>

    <div class="from-slate-200 to-lime-100 h-full bg-gradient-to-tl pt-16">
      <button
        class="bg-black text-white rounded-md text-lg p-2"
        (click)="handleResub()"
      >
        Resub
      </button>
    </div>

    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  constructor(private weatherDataService: WeatherDataService) {}

  ngOnInit() {
    this.weatherDataService
      .getDataset({
        name: 'relativehumidity_2m',
        interval: 'hourly',
      })
      .subscribe((data) => {
        console.log(data);
      });

    this.weatherDataService
      .getDataset({
        name: 'direct_radiation',
        interval: 'hourly',
      })
      .subscribe((data) => {
        console.log(data);
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
