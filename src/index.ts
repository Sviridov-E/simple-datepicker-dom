import DatepickerDom from "./DatepickerDom";

const input: HTMLInputElement | undefined = document.querySelector("input#app");

new DatepickerDom(input, {lang: 'ru'});