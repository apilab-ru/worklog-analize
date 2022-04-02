import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Item } from "../chart/interface";
import { Log, LogDetail } from "../../interfaces";

interface ViewItem extends Log {
  percentLocal: number;
  percentGlobal: number;
  hours: number;
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit {
  items: ViewItem[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      item: Item,
      total: number,
    },
  ) {
  }

  ngOnInit(): void {
    this.items = this.data.item.deps
      .map(it => this.calcItem(it, this.data.total, this.data.item.time))
    this.items.sort((a, b) => b.time - a.time);
  }

  private calcItem(item: Log, totalGlobal: number, totalLocal: number): ViewItem {
    return {
      ...item,
      percentLocal: Math.ceil(item.time / totalLocal * 10000) / 100,
      percentGlobal: Math.ceil(item.time / totalGlobal * 10000) / 100,
      hours: Math.ceil(item.time / 60 * 100) / 100
    }
  }

}
