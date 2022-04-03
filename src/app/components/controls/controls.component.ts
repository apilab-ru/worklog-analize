import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserDataService } from "../../services/user-data.service";

@UntilDestroy()
@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlsComponent implements OnInit {
  formGroup = new FormGroup({
    logs: new FormControl(),
    rules: new FormControl(),

    groupConfig: new FormGroup({
      groupByTask: new FormControl(true),
      groupByComment: new FormControl(true),
      groupByRules: new FormControl(false),
    })
  })

  constructor(
    private userDataService: UserDataService,
  ) {
  }

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(
      untilDestroyed(this),
    ).subscribe(form => {
      this.userDataService.saveData(form);
    });

    const formData = this.userDataService.loadData();
    this.formGroup.patchValue(formData, { emitEvent: true });
  }
}
