# WorklogAnalize

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Script parser logs

let list = [];
document.querySelector('#timeSheetContent').querySelectorAll('tr').forEach(tr => {
  let item = [].reduce.bind(tr.querySelectorAll('td'))((prev, item, index) => ({
    ...prev, [index]: item.textContent
  }), {});
  list.push(item);
});
copy(list.slice(1, list.length - 2));
