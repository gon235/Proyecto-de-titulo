import { Component, Input, OnInit } from '@angular/core';

interface Mantencion {
  id: string;
  nombremantencion: string;
  fechahora: string;
  nivelurgencia: string;
  estado: string;
  nombrevehiculo: string;
}

interface CalendarDay {
  date: Date;
  mantenciones: Mantencion[];  // Ahora especificamos el tipo exacto
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-maintenance-calendar',
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="month-year">
          {{ currentDate | date:'MMMM yyyy' }}
        </div>
      </div>
      <div class="weekdays">
        <div class="weekday" *ngFor="let day of weekDays">{{ day }}</div>
      </div>
      <div class="calendar-grid">
        <div 
          *ngFor="let day of calendarDays" 
          class="calendar-day"
          [ngClass]="{
            'has-maintenance': day.mantenciones.length > 0,
            'current-month': day.isCurrentMonth,
            'other-month': !day.isCurrentMonth
          }"
        >
          <div class="day-number">{{ day.date | date:'d' }}</div>
          <div class="maintenance-count" *ngIf="day.mantenciones.length > 0">
            {{ day.mantenciones.length }}
          </div>
          <div class="maintenance-tooltip" *ngIf="day.mantenciones.length > 0">
            <div 
              *ngFor="let mantencion of day.mantenciones" 
              class="maintenance-item"
            >
              {{ mantencion.nombremantencion }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .calendar-header {
      padding: 8px;
      text-align: center;
      background: var(--ion-color-tertiary);
      color: white;
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      padding: 5px 0;
      background: var(--ion-color-tertiary-tint);
      color: var(--ion-color-tertiary-contrast);
    }

    .weekday {
      text-align: center;
      font-weight: bold;
      font-size: 0.8em;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #eee;
    }

    .calendar-day {
      aspect-ratio: 1/0.8;
      background: white;
      padding: 4px;
      position: relative;
      min-height: 40px;
    }

    .day-number {
      font-size: 0.9em;
      font-weight: 500;
    }

    .has-maintenance {
      background: var(--ion-color-tertiary-tint);
    }

    .other-month {
      opacity: 0.5;
    }

    .maintenance-count {
      position: absolute;
      right: 4px;
      top: 4px;
      background: var(--ion-color-tertiary);
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.8em;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .maintenance-tooltip {
      display: none;
      position: absolute;
      background: white;
      border: 1px solid var(--ion-color-tertiary);
      padding: 8px;
      border-radius: 4px;
      z-index: 100;
      width: 200px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      left: 50%;
      transform: translateX(-50%);
    }

    .calendar-day:hover .maintenance-tooltip {
      display: block;
    }

    .maintenance-item {
      padding: 2px 4px;
      margin: 2px 0;
      font-size: 0.8em;
      background: var(--ion-color-tertiary-tint);
      color: var(--ion-color-tertiary-contrast);
      border-radius: 3px;
    }

    @media (max-width: 768px) {
      .calendar-day {
        aspect-ratio: 1/0.6;
        min-height: 30px;
      }
      
      .day-number {
        font-size: 0.8em;
      }
      
      .maintenance-count {
        width: 16px;
        height: 16px;
        font-size: 0.7em;
      }
    }
  `]
})
export class MaintenanceCalendarComponent implements OnInit {
  @Input() mantenciones: Mantencion[] = [];
  calendarDays: CalendarDay[] = [];
  currentDate: Date = new Date();
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  ngOnInit() {
    this.generateCalendar();
  }

  ngOnChanges() {
    if (this.mantenciones) {
      this.generateCalendar();
    }
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const calendar: CalendarDay[] = [];

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayMantenciones = this.mantenciones.filter(m => {
        const mantencionDate = new Date(m.fechahora);
        return (
          mantencionDate.getDate() === currentDate.getDate() &&
          mantencionDate.getMonth() === currentDate.getMonth() &&
          mantencionDate.getFullYear() === currentDate.getFullYear()
        );
      });

      calendar.push({
        date: currentDate,
        mantenciones: dayMantenciones,
        isCurrentMonth: currentDate.getMonth() === month
      });
    }

    this.calendarDays = calendar;
  }
}