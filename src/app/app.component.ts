import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ROUTES } from './routes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  githubLink = 'https://github.com/apilab-ru/worklog-analize';
  menu = ROUTES;
}
