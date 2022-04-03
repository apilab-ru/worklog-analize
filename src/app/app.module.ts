import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { PageComponent } from './components/page/page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { HelpComponent } from './components/help/help.component';
import { RouterModule } from "@angular/router";
import { ROUTES } from "./routes";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ControlsComponent } from './components/controls/controls.component';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ChartComponent } from './components/chart/chart.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DetailsComponent } from './components/details/details.component';

@NgModule({
  declarations: [
    AppComponent,
    PageComponent,
    HelpComponent,
    ControlsComponent,
    ChartComponent,
    DetailsComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTooltipModule,
    FormsModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
