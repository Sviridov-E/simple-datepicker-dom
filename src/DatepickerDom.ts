import DatepickerCore from "@segor/simple-datepicker";
import { HTMLTableBody, Options, State, TableBodyCash, TableElements } from "./types";
import buildSheet from "./buildSheet";
import { DateRange, MonthTails, Slice } from "@segor/simple-datepicker/dist/types/types";
import "./style.scss";

const defaultOptions: Options = {
    closeWhenSelected: false,
    showMonthTails: true,
    size: '',
    lang: 'en',
    onOk: null,
    onCancel: null
};
class DatepickerDom {
    core: DatepickerCore;
    tableBodyCash: TableBodyCash;
    pickerElements: TableElements;
    selectedCells: HTMLElement | null;
    params: Options;
    state: State;
    root: HTMLInputElement;
    constructor(root: HTMLInputElement, params?: Options) {
        this.params = { ...defaultOptions, ...params };
        this.root = root;
        this.core = new DatepickerCore();

        // State //////////////////////
        this.selectedCells = null;
        this.tableBodyCash = {};
        this.state = {
            datepickerIsOpen: false,
            monthSelectorIsOpen: false,
            yearSelectorIsOpen: false,
        };
        ///////////////////////////////

        this._buildTableBody = this._buildTableBody.bind(this);

        this.pickerElements = buildSheet({size: this.params.size, lang: this.params.lang});

        this.appendTableBody();
        this.updateSelectors();
        this.mount(root, this.pickerElements.datepickerElement);
        this.addEventListeners();
    }

    // Mounts the datepicker element to the DOM
    mount(root: HTMLElement, element: HTMLElement) {
        root.after(element);
        root.addEventListener("click", () => {
            if (this.state.datepickerIsOpen) return;
            this.openDatepicker();
        });
    }
    openDatepicker(): void {
        this.toPosition();
        this.pickerElements.datepickerElement.classList.remove("closed");
        this.state.datepickerIsOpen = true;
    }
    closeDatepicker(): void {
        if (!this.state.datepickerIsOpen) return;
        const datepicker = this.pickerElements.datepickerElement;
        datepicker.addEventListener("transitionend", addClosed);
        datepicker.classList.add("closing");
        this.state.datepickerIsOpen = false;
        function addClosed(e) {
            if (e.target !== datepicker) return;
            datepicker.classList.add("closed");
            datepicker.classList.remove("closing");
            datepicker.removeEventListener("transitionend", addClosed);
        }
    }

    // Triggers when the date is selected
    clickCell(cell: HTMLElement): void {
        if (cell === this.selectedCells) return;
        if (cell.classList.contains("empty")) return;
        if (cell.classList.contains("month-tail")) {
            Number(cell.textContent) > 10 ? this.decreaseOneMonth() : this.increaseOneMonth();
            return;
        }
        const newDate = {
            y: this.core.shownDate.getFullYear(),
            m: this.core.shownDate.getMonth(),
            d: Number(cell.textContent),
        };
        this.core.setSelectedDate(newDate);
        this.selectedCells?.classList.remove("selected-cell");
        cell.classList.add("selected-cell");
        this.selectedCells = cell;

        if (this.params.closeWhenSelected) this.submitHandler();
    }

    // Updates title of year and month selectors
    updateSelectors(): void {
        const { monthSelector, yearSelector } = this.pickerElements.actionElements;
        monthSelector.querySelector("h4").textContent =
            this.pickerElements.titles.months[this.core.shownDate.getMonth()];
        yearSelector.querySelector("h4").textContent = String(this.core.shownDate.getFullYear());
    }

    // Changes shown date, updates all required elements
    changeShownDate(month: number, year: number): void {
        this.core.setShownDate(month, year);
        this.updateTableBody();
        this.updateSelectors();
    }

    // Triggers when an arrow buttons is clicked
    increaseOneMonth(): void {
        let [month, year] = [this.core.shownDate.getMonth(), this.core.shownDate.getFullYear()];
        month++;
        if (month > 11) {
            year++;
            month -= 12;
        }
        this.changeShownDate(month, year);
    }
    decreaseOneMonth(): void {
        let [month, year] = [this.core.shownDate.getMonth(), this.core.shownDate.getFullYear()];
        month--;
        if (month < 0) {
            year--;
            month += 12;
        }
        this.changeShownDate(month, year);
    }

    // Sets shown month
    setMonth(month: number): void {
        const year = this.core.shownDate.getFullYear();
        this.changeShownDate(month, year);
    }

    // Sets shown year
    setYear(year: number): void {
        const month = this.core.shownDate.getMonth();
        this.changeShownDate(month, year);
    }

    // Triggers when an OK button is clicked
    submitHandler(): void {
        const date: Date = this.core.selectedDate[0] || this.core.selectedDate || this.core.shownDate[0] || this.core.shownDate;
        if(!this.params.onOk) {
            renderValueToInput.call(this, date);
            this.closeDatepicker()
            return;
        }
        renderValueToInput.call(this, date);
        const cb = this.params.onOk;
        cb && cb(date);
        this.closeDatepicker();

        function renderValueToInput(value: Date) {
            let formatter = new Intl.DateTimeFormat(this.params.lang);
            this.root.value = formatter.format(value);
        }
    }

    // Triggers when a Cancel button is clicked
    cancleHandler(): void {
        const cb = this.params.onCancel;
        this.core.selectedDate = null;
        this.closeDatepicker();
        cb && cb();
    }

    // Returns the DOM table body from cash or calculates new
    getTableBody(month: number, year: number): HTMLTableBody {
        let tableBody: HTMLTableBody = this.tableBodyCash[`${month}${year}`];
        if (tableBody) return tableBody;

        if (Object.keys(this.tableBodyCash).length > 20) this.tableBodyCash = {};
        const slice: Slice = this.core.getMonthSlice(month, year);
        tableBody = this._buildTableBody(slice, [month, year]);
        this.tableBodyCash[`${month}${year}`] = tableBody;
        return tableBody;
    }
    getSelectedDate(): Date | DateRange | null {
        return this.core.selectedDate || null;
    }
    // builds the DOM Table Body with dates
    _buildTableBody(slice: Slice, date: [number, number]): HTMLTableBody {
        const tableBody: HTMLTableSectionElement = document.createElement("tbody");

        let tails: MonthTails;
        if (this.params.showMonthTails) {
            tails = this.core.getMonthTails(...date);

            // if month starts with monday, show full last week of prev month;
            const firstDayIsMonday: boolean = !!slice[0][0];
            if (firstDayIsMonday) {
                const rowElement: HTMLTableRowElement = document.createElement("tr");
                tails.prev.forEach((date) => {
                    const dayElement = createDateCell(date, "month-tail");
                    rowElement.append(dayElement);
                });
                tableBody.append(rowElement);
            }
        }

        slice.forEach((week, ind) => {
            const rowElement: HTMLTableRowElement = document.createElement("tr");
            for (let i = 0; i < 7; ++i) {
                let day: number | undefined = week[i];
                let dayElement: HTMLTableCellElement;
                const isEmpty: boolean = !day;
                if (isEmpty) {
                    // If showing month tails
                    if (this.params.showMonthTails) {
                        day = ind ? tails.next[i] : tails.prev[i];
                        dayElement = createDateCell(day, "month-tail");
                    }
                    /////////////////////////
                    else {
                        dayElement = createDateCell(null, "empty");
                    }
                } else {
                    dayElement = createDateCell(day);
                }
                rowElement.append(dayElement);
            }
            tableBody.append(rowElement);
        });

        // if last day in month is sunday and month tails are shown;
        if (this.params.showMonthTails && slice[slice.length - 1][6]) {
            tails = this.core.getMonthTails(...date);
            const rowElement: HTMLTableRowElement = document.createElement("tr");
            tails.next.forEach((date) => {
                const dayElement = createDateCell(date, "month-tail");
                rowElement.append(dayElement);
            });
            tableBody.append(rowElement);
        }

        function createDateCell(index: number | null, addedClass?: string): HTMLTableCellElement {
            const dayElement: HTMLTableCellElement = document.createElement("td");
            addedClass && dayElement.classList.add(addedClass);
            if (!index) return dayElement;

            dayElement.insertAdjacentText("beforeend", String(index));
            return dayElement;
        }
        return tableBody;
    }

    // Removes table body
    resetTableBody(): void {
        const tbody: HTMLTableBody = this.pickerElements.tableElement?.querySelector("tbody");
        tbody?.classList.remove("visible");
        tbody?.remove();
    }

    // Creates and appends new table body
    appendTableBody(): void {
        const date: Date = this.core.shownDate;
        const tbody: HTMLTableBody = this.getTableBody(date.getMonth(), date.getFullYear());

        this.pickerElements.tableElement?.append(tbody);
        setTimeout(() => tbody.classList.add("visible"), 0);
    }

    // Removes table body, gets new and mounts;
    updateTableBody(): void {
        this.resetTableBody();
        this.appendTableBody();
    }

    toPosition(): void {
        const inputCoords = this.root.getBoundingClientRect();
        const inputPosition = {
            top: inputCoords.top + window.pageYOffset,
            bottom: inputCoords.bottom + window.pageYOffset,
            left: inputCoords.left + window.pageXOffset,
            right: inputCoords.right + window.pageXOffset,
        };
        const pickerSize = {
            height: this.pickerElements.datepickerElement.offsetHeight,
            width: this.pickerElements.datepickerElement.offsetWidth
        }
        const documentSize = {
            height: Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight,
                document.body.clientHeight,
                document.documentElement.clientHeight
            ),
            width: Math.max(
                document.body.scrollWidth,
                document.documentElement.scrollWidth,
                document.body.offsetWidth,
                document.documentElement.offsetWidth,
                document.body.clientWidth,
                document.documentElement.clientWidth
            )
        };

        let balancer = {
            top: 0,
            left: 0
        }

        if(inputPosition.top + pickerSize.height > documentSize.height) {
            balancer.top = documentSize.height - (inputPosition.top + pickerSize.height)
        }
        if(inputPosition.left + pickerSize.width > documentSize.width) {
            balancer.left = documentSize.width - (inputPosition.left + pickerSize.width)
        }
        this.pickerElements.datepickerElement.style.top = String(inputPosition.top + balancer.top) + "px";
        this.pickerElements.datepickerElement.style.left = String(inputPosition.left + balancer.left) + "px";

        /* 

        */
    }

    // Adds all event listeners
    addEventListeners(): void {
        const { monthSelector, yearSelector, prevMonthBtn, nextMonthBtn, submitBtn, cancelBtn } =
            this.pickerElements.actionElements;
        const table: HTMLTableElement | null = this.pickerElements.tableElement;
        monthSelector?.addEventListener("click", (e) => {
            const selector: HTMLDivElement = monthSelector.querySelector(".month-list");
            if (this.state.monthSelectorIsOpen) {
                const target: HTMLElement = e.target as HTMLElement;
                if (target.tagName !== "LI") return;

                const changeEvent: Event = new Event("change", { bubbles: true });
                target.dispatchEvent(changeEvent);
                selector.classList.add("hidden");
                return (this.state.monthSelectorIsOpen = false);
            }
            selector.classList.remove("hidden");

            this.state.monthSelectorIsOpen = true;

            document.addEventListener("click", closeMonthSelector.bind(this));

            function closeMonthSelector(e): void {
                if (e.target.closest(".selectors .month")) return;
                selector.classList.add("hidden");
                this.state.monthSelectorIsOpen = false;
                document.removeEventListener("click", closeMonthSelector);
            }
        });
        yearSelector?.addEventListener("click", (e) => {
            const selector: HTMLDivElement = yearSelector.querySelector(".year-list");
            if (this.state.yearSelectorIsOpen) {
                const target: HTMLElement = e.target as HTMLElement;
                if (target.tagName !== "LI") return;

                const changeEvent: Event = new Event("change", { bubbles: true });
                target.dispatchEvent(changeEvent);
                selector.classList.add("hidden");
                return (this.state.yearSelectorIsOpen = false);
            }
            selector.classList.remove("hidden");

            this.state.yearSelectorIsOpen = true;

            document.addEventListener("click", closeYearSelector.bind(this));

            function closeYearSelector(e): void {
                if (e.target.closest(".selectors .year")) return;
                selector.classList.add("hidden");
                this.state.yearSelectorIsOpen = false;
                document.removeEventListener("click", closeYearSelector);
            }
        });
        monthSelector?.addEventListener("change", (e) => {
            const value: number = Number((e.target as HTMLElement)?.dataset.value);
            this.setMonth(value);
        });
        yearSelector?.addEventListener("change", (e) => {
            const value: number = Number((e.target as HTMLElement)?.dataset.value);
            this.setYear(value);
        });
        prevMonthBtn?.addEventListener("click", () => {
            this.decreaseOneMonth();
        });
        nextMonthBtn?.addEventListener("click", () => {
            this.increaseOneMonth();
        });
        submitBtn?.addEventListener("click", () => {
            this.submitHandler();
        });
        cancelBtn?.addEventListener("click", () => {
            this.cancleHandler();
        });
        table?.addEventListener("click", (e) => {
            const clickedElement: HTMLElement = e.target as HTMLElement;
            if (clickedElement.tagName !== "TD" || !clickedElement.closest("tbody")) return;
            this.clickCell(clickedElement);
        });
    }
}

export default DatepickerDom;
