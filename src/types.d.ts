export type HTMLTableBody = HTMLTableSectionElement;
export type ActionElements = {
    monthSelector: HTMLDivElement | null;
    yearSelector: HTMLDivElement | null;
    prevMonthBtn: HTMLButtonElement | null;
    nextMonthBtn: HTMLButtonElement | null;
    submitBtn: HTMLButtonElement | null;
    cancelBtn: HTMLButtonElement | null;
};
export type State = {
    datepickerIsOpen: boolean;
    monthSelectorIsOpen: boolean;
    yearSelectorIsOpen: boolean;
}
export interface TableBodyCash {
    [key: string]: HTMLTableBody;
}
export interface TableElements {
    datepickerElement: HTMLDivElement;
    actionElements: ActionElements;
    tableElement: HTMLTableElement | null;
    titles: {
        [key: string]: string[]
      }
}
export interface Options {
    closeWhenSelected?: boolean;
    showMonthTails?: boolean;
    size?: '' | 'large' | 'small';
    lang?: '' | 'en' | 'ru';
    onOk?: (date: Date) => void | null;
    onCancel?: () => void | null;
}
export interface MonthLists {
    [key: string]: Array<string>;
}