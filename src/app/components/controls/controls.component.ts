import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { combineLatest, Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { AnalyzerService } from "../../services/analyzer.service";
import { GroupConfig, Log, Rule } from "../../interfaces";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

const STORAGE_KEY = 'workLogAnalyzeForm';

@UntilDestroy()
@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlsComponent implements OnInit {
  @Output() rulesChanges = new EventEmitter<Rule[]>();
  @Output() logsChanges = new EventEmitter<Log[]>();

  @Output() groupConfigChanges = new EventEmitter<GroupConfig>();

  formGroup = new FormGroup({
    workLogControl: new FormControl(),
    rules: new FormControl(),

    groupByTask: new FormControl(true),
    groupByComment: new FormControl(true),
    groupByRules: new FormControl(false),
  })

  constructor(
    private analyzerService: AnalyzerService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(
      untilDestroyed(this),
    ).subscribe(form => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    });

    const formData = localStorage.getItem(STORAGE_KEY);
    if (formData) {
      this.formGroup.patchValue(JSON.parse(formData), { emitEvent: true });
    }

    this.getControlChanges('rules').pipe(
      map(rules => this.decodeRules(rules)),
      map(rules => this.analyzerService.parserRules(rules)),
      untilDestroyed(this),
    ).subscribe((rules) => {
      this.rulesChanges.emit(rules);
    }, error => {
      this.snackBar.open(error.toString());
      console.error(error);
    })

    this.getControlChanges('workLogControl').pipe(
      map(value => JSON.parse(value)),
      map(logs => this.analyzerService.convertLogs(logs)),
      untilDestroyed(this),
    ).subscribe(logs => {
      this.logsChanges.emit(logs);
    }, error => {
      this.snackBar.open(error.toString());
      console.error(error);
    })

    combineLatest([
      this.getControlChanges<boolean>('groupByTask'),
      this.getControlChanges<boolean>('groupByComment'),
      this.getControlChanges<boolean>('groupByRules'),
    ]).pipe(untilDestroyed(this))
      .subscribe(([groupByTask, groupByComment, groupByRules]) => this
        .groupConfigChanges.emit({ groupByTask, groupByComment, groupByRules })
      );
  }

  private decodeRules(rules: string | null): string[] {
    if (!rules) {
      return [];
    }

    return rules.split('\n');
  }

  private getControl(name: string): AbstractControl {
    return this.formGroup.get(name)!;
  }

  private getControlChanges<T = string>(name: string): Observable<T> {
    return this.getControl(name).valueChanges.pipe(startWith(this.getControl(name).value));
  }

}
