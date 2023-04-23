import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <!-- Toolbar -->
    <div
      class="absolute top-0 left-0 right-0 h-16 flex items-center bg-blue-600 text-white font-semibold gap-4 px-8"
      role="banner"
    >
      <img
        width="40"
        alt="Angular Logo"
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg=="
      />
      <span>Welcome</span>
    </div>

    <div
      class="flex flex-col max-w-screen-md mx-auto items-center my-28"
      role="main"
    >
      <!-- Next Steps -->
      <h2>Next Steps</h2>
      <p>What do you want to do next with your app?</p>

      <div class="my-4 flex flex-wrap justify-center gap-4">
        <button
          *ngFor="let guide of guides; index as i"
          class="shadow-lg hover:shadow-black/30 duration-300 transition-all px-4 py-8 rounded-md"
          (click)="selectedGuide = i"
          [ngClass]="{
            'text-white bg-blue-600 ': selectedGuide === i,
            'bg-slate-200 ': selectedGuide !== i
          }"
          tabindex="0"
        >
          +
          <span>{{ guide.title }}</span>
        </button>
      </div>

      <!-- Terminal -->
      <div
        class="relative w-[80%] max-w-[600px] rounded-md pt-12 mt-2 bg-black overflow-y-hidden text-white p-4"
        [ngSwitch]="selectedGuide"
      >
        <!-- Console Top Bar -->
        <div
          class="absolute top-0 left-0 bg-slate-600 w-full text-3xl px-4 tracking-widest leading-6 pb-1 box-border"
        >
          &bull;&bull;&bull;
        </div>
        <!-- Console Body -->
        <ng-container *ngFor="let guide of guides; index as i">
          <pre *ngSwitchCase="i">{{ guide.command }}</pre>
        </ng-container>
      </div>
    </div>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title = 'ng-sc';
  guides = [
    {
      title: 'new component',
      command: 'ng generate component xyz',
    },
    {
      title: 'angular material',
      command: 'ng add @angular/material',
    },
    {
      title: 'add PWA',
      command: 'ng add @angular/pwa',
    },
    {
      title: 'add dependency',
      command: 'ng add _____',
    },
    {
      title: 'run and watch tests',
      command: 'ng test',
    },
    {
      title: 'build for production',
      command: 'ng build',
    },
  ];
  selectedGuide = 0;
}
