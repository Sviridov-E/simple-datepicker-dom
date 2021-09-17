# Simple Datepicker DOM

[![npm](https://img.shields.io/npm/v/@segor/simple-datepicker?label=npm)](https://www.npmjs.com/package/@segor/simple-datepicker-dom) [![GitHub package.json version](https://img.shields.io/github/package-json/v/Sviridov-e/simple-datepicker-core?color=green&label=github)](https://github.com/Sviridov-E/simple-datepicker-dom)
Нативный компонент для выбора даты
## Установка
```bash
npm install @segor/simple-datepicker-dom
```
или
```bash
yarn add @segor/simple-datepicer-dom
```
## Инициализация 
```ts
import DatepickerDom from "@segor/simple-datepicker-dom";

const HTMLInput = document.querySelector("input#myInput");

const options = {
    closeWhenSelected: true | false, // Закрывать при клике на дату. По умолчанию false
    showMonthTails: true | false,    // Отображать начало следующего и конец предыдущего месяца. По умолчанию true
    size: '' | 'small' | 'large',    // Размер элемента. По умолчанию ''
    lang: 'en' | 'ru',               // Язык. По умолчанию 'en'
    onOk: () => {},                  // Callback при нажатии Ок
    onCancel: () => {}               // Callback при нажатии Cancle
};
const datepicker = new DatepickerDom(HTMLInput, options);
```
## Методы

### openDatepicker
```ts
datepicker.openDatepicker(): void;
```
Делает компонент видимым. По умолчанию срабатывает при клике на Input.

---
### closeDatepicker
```ts
datepicker.closeDatepicker(): void;
```
Делает компонент невидимым. По умолчанию срабатывает при клике на Cancel/Отмена.

---