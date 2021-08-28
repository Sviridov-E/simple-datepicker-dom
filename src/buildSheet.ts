import { ActionElements, MonthLists, TableElements } from "./types";

interface Options {
    lang?: "" | "ru" | "en";
    years?: [number, number];
    size?: "" | "large" | "small";
}

const months: { [key: string]: Array<string> } = {
    en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],
    ru: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
    ],
};
const days: { [key: string]: Array<string> } = {
    en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
};

const defaultOptions: Options = {
    lang: "en",
    years: [1980, new Date().getFullYear()],
    size: ""
};
function buildSheet(opt: Options = {}): TableElements {
    const options = { ...defaultOptions, ...opt };

    let years: number[] = [];
    for (let i = 0; i <= options.years[1] - options.years[0]; ++i) {
        years.push(options.years[0] + i);
    }

    const template: string = `
      <header class="head">
        <div class="selectors">
          <div class="month">
            <h4>Month</h4>
            <ul class="month-list list hidden">
            ${months[options.lang].reduce((str, month, ind) => str + `<li data-value="${ind}">${month}</li>`, '')}
            </ul>
          </div>
          <div class="year">
            <h4>Year</h4>
            <ul class="year-list list hidden">
            ${years.reduce((str, year) => str + `<li data-value="${year}">${String(year)}</li>`, '')}</ul>
          </div>
        </div>
        <div class="flipers">
          <button class="prev-month left"></button>
          <button class="next-month right"></button>
        </div>
      </header>
      <main class="body">
      <table>
        <thead>
          <tr>
          ${days[options.lang].reduce((str, day) => str + `<td>${day}</td>`, '')}
          </tr>
        </thead>
      </table>
    </main>
    <footer class="bottom">
      <button class="ok-btn btn">Ok</button>
      <button class="cancel-btn btn">Cancel</button>
    </footer>
  `;
    const datepickerElement: HTMLDivElement = document.createElement("div");
    datepickerElement.classList.add("datepicker");
    options.size && datepickerElement.classList.add(options.size);
    datepickerElement.classList.add("closed");

    datepickerElement.innerHTML = template;
    const actionElements: ActionElements = {
        monthSelector: datepickerElement.querySelector(".selectors .month"),
        yearSelector: datepickerElement.querySelector(".selectors .year"),
        prevMonthBtn: datepickerElement.querySelector(".head .flipers .prev-month"),
        nextMonthBtn: datepickerElement.querySelector(".head .flipers .next-month"),
        submitBtn: datepickerElement.querySelector(".bottom .ok-btn"),
        cancelBtn: datepickerElement.querySelector(".bottom .cancel-btn"),
    };
    const tableElement: HTMLTableElement | null = datepickerElement.querySelector(".body table");

    const titles = {
      months: months[options.lang]
    }

    return { datepickerElement, actionElements, tableElement, titles };
}

export default buildSheet;
