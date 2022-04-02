import { Routes } from "@angular/router";
import { PageComponent } from "./components/page/page.component";
import { HelpComponent } from "./components/help/help.component";

export const ROUTES: Routes = [
  {
    path: '',
    component: PageComponent,
    data: { name: 'Main' }
  },
  {
    path: 'help',
    component: HelpComponent,
    data: { name: 'Help' }
  }
];
