import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import Chart from 'chart.js/auto'
import { LogDetail } from "../../interfaces";
import { Observable, ReplaySubject } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { PREPARED_COLORS } from "./const";
import { MatDialog } from "@angular/material/dialog";
import { DetailsComponent } from "../details/details.component";
import { Item } from "./interface";

@UntilDestroy()
@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() items: LogDetail[];

  items$ = new ReplaySubject<Item[]>(1);
  total$ = new ReplaySubject<number>(1);

  private chart: Chart;
  private total: number;
  @ViewChild('chart', { static: true }) private chartCanvas: ElementRef<HTMLCanvasElement>;

  constructor(
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'pie',
      data: {
        datasets: [{
          data: [],
          backgroundColor: [],
        }],

        labels: []
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          }
        },
      }
    });

    this.initChartUpdate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.items && this.items) {
      this.total = this.items.reduce((prev, it) => prev + it.time, 0);
      this.total$.next(
        Math.ceil(this.total / 60 * 100) / 100
      )
      this.items$.next(this.items.map(item => this.prepareItem(item, this.total)))
    }
  }

  setActive(index: number): void {
    this.chart.setActiveElements([{ datasetIndex: 0, index }]);
    this.chart.tooltip!.setActiveElements([{ datasetIndex: 0, index }], {
      x: 150,
      y: 150
    });
    this.chart.update();
  }

  openDetails(item: Item): void {
    this.dialog.open(DetailsComponent, {
      data: { item, total: this.total },
    })
  }

  private prepareItem(item: LogDetail, total: number): Item {
    return {
      ...item,
      color: this.generateColor(item.key),
      percent: Math.round(item.time / total  * 10000) / 100,
      hours: Math.round(item.time / 60  * 100) / 100
    }
  }

  private generateColor(key: string): string {
    if (PREPARED_COLORS[key]) {
      return PREPARED_COLORS[key]
    }

    const r = Math.floor(Math.random() * (256));
    const g = Math.floor(Math.random() * (256));
    const b = Math.floor(Math.random() * (256));
    const color = '#' + r.toString(16) + g.toString(16) + b.toString(16);

    if (this.checkValidColor(color)) {
      return color;
    } else {
      return this.generateColor(key);
    }
  }

  private checkValidColor(color: string): boolean {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  private initChartUpdate(): void {
    this.items$.pipe(
      untilDestroyed(this)
    ).subscribe(list => {
      this.chart.config.data.labels = [];
      this.chart.config.data.datasets[0].data = [];
      this.chart.config.data.datasets[0].backgroundColor = list.map(it => it.color);

      list.forEach(item => {
        this.chart.config.data.labels!.push(item.name || item.key);
        this.chart.config.data.datasets[0].data.push(item.hours);
      });

      this.chart.update();
    })
  }
}
