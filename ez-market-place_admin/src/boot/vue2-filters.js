// https://github.com/freearhey/vue2-filters

import Vue from 'vue'
import Vue2Filters from 'vue2-filters'

Vue.use(Vue2Filters)

// ***************************************************
// To use one of the predefined methods (such as limitBy,
// filterBy, find, or orderBy) in your component, you also 
// need to add Vue2Filters.mixin to mixin list:

// // import Vue2Filters from 'vue2-filters'

// // export default {
// //   ...
// //   mixins: [Vue2Filters.mixin],
// //   ...
// // }

// ***************************************************
// Available Filters
// https://github.com/freearhey/vue2-filters#available-filters
// ****************
// capitalize
// uppercase
// lowercase
// placeholder
// truncate
// number
// bytes
// percent
// currency
// pluralize
// ordinal
// limitBy
// filterBy
// find
// orderBy
// Usage

// ****************

// capitalize
// Arguments:

// {Object} [options] - default: {}
// Options:

// {Boolean} [onlyFirstLetter] - default: false
// Example:

// {{ msg | capitalize }} // 'abc' => 'Abc'
// Capitalize only first letter of sentence:

// {{ msg | capitalize({ onlyFirstLetter: true }) }} // 'lorem ipsum dolor' => 'Lorem ipsum dolor'
// uppercase
// Example:

// {{ msg | uppercase }} // 'abc' => 'ABC'
// lowercase
// Example:

// {{ msg | lowercase }} // 'ABC' => 'abc'
// placeholder
// Arguments:

// {String} [placeholder]
// Example:

// {{ msg | placeholder('Text if msg is missing') }} // '' => 'Text if msg is missing'
// truncate
// Arguments:

// {Number} [length] - default: 15
// Example:

// {{ msg | truncate(10) }} // 'lorem ipsum dolor' => 'lorem ipsu...'
// number
// Arguments:

// {String} [format] - default: ''
// {Object} [options] - default: {}
// Options:

// {String} [thousandsSeparator] - default: ','
// {String} [decimalSeparator] - default: '.'
// Examples:

// {{ 123456 | number('0,0') }} // => 123,456
// Change the number of digits after the decimal point:

// {{ 12345.67 | number('0.0000') }} // => 12345.6700
// Add a plus or minus sign to the beginning:

// {{ 123456 | number('+0') }} // => +123456
// {{ 123456 | number('-0') }} // => -123456
// Show number in thousand (K) or in millions (M):

// {{ 123456 | number('0a') }} // => 123K
// {{ 123456 | number('0 a') }} // => 123 K
// {{ 123456789 | number('0a') }} // => 123M
// Use a different thousands separator:

// {{ 1234567 | number('0,0', { thousandsSeparator: ' ' }) }} // => 1 234 567
// Use a different decimal separator:

// {{ 12345.67 | number('0.00', { decimalSeparator: '|' }) }} // => 12,345|67
// bytes
// Arguments:

// {Number} [decimalDigits] - default: 2
// Examples:

// {{ 1 | bytes }}              // => 1 byte
// {{ 20 | bytes }}             // => 20 bytes
// {{ 2000 | bytes }}           // => 1.95 kB
// {{ 2000000 | bytes }}        // => 1.91 MB
// {{ 2000000000 | bytes }}     // => 1.86 GB
// {{ 2000000000000 | bytes }}  // => 1.82 TB
// Change the number of digits after the decimal point:

// {{ 2000000000 | bytes(4) }}  // => 1.8626 GB
// percent
// Arguments:

// {Number} [decimalDigits] - default: 0
// {Number} [multiplier] - default: 100
// {Object} [options] - default: {}
// Options:

// {String} [decimalSeparator] - default: '.'
// Examples:

// {{ 0.01 | percent }} // => 1%
// {{ 0.1 | percent }} // => 10%
// {{ 1 | percent }} // => 100%
// {{ 100 | percent }} // => 10000%
// {{ 0.97 | percent }} // => 97%
// Change the number of digits after the decimal point:

// {{ 0.974878234 | percent(3) }} // => 97.488%
// Change the multiplier:

// {{ 0.974878234 | percent(3, 150) }} // => 146.232%
// Use a different decimal separator:

// {{ 0.07 | percent(2, 100, { decimalSeparator: '|' }) }} // => 7|00%
// currency
// Arguments:

// {String} [symbol] - default: '$'
// {Number} [decimalDigits] - default: 2
// {Object} [options] - default: {}
// Options:

// {String} [thousandsSeparator] - default: ','
// {String} [decimalSeparator] - default: '.'
// {Boolean} [symbolOnLeft] - default: true
// {Boolean} [spaceBetweenAmountAndSymbol] - default: false
// {Boolean} [showPlusSign] - default: false
// Example:

// {{ amount | currency }} // 12345 => $12,345.00
// Use a different symbol:

// {{ amount | currency('£') }} // 12345 => £12,345.00
// Use a different number decimal places:

// {{ amount | currency('₽', 0) }} // 12345 => ₽12,345
// Use a different thousands separator:

// {{ amount | currency('$', 0, { thousandsSeparator: '.' }) }} // 12345 => $12.345
// Use a different decimal separator:

// {{ amount | currency('$', 2, { decimalSeparator: ',' }) }} // 12345 => $12,345,00
// Use symbol on right:

// {{ amount | currency('$', 0, { symbolOnLeft: false }) }} // 12345 => 12,345$
// Add space between amount and symbol:

// {{ amount | currency('$', 0, { spaceBetweenAmountAndSymbol: true }) }} // 12345 => $ 12,345
// Show the plus sign if the value is greater than zero:

// {{ amount | currency('$', 0, { showPlusSign: true }) }} // 12345 => +$12,345
// Use multiple options:

// {{ amount | currency('kr', 2, { symbolOnLeft: false, spaceBetweenAmountAndSymbol: true }) }} // 12345 => 12,345.00 kr
// pluralize
// Arguments:

// {String|Array} single or Array(single, double, triple, ...)
// {Object} [options] - default: {}
// Options:

// {Boolean} [includeNumber] - default: false
// Example:

// {{ count }} {{ count | pluralize('item') }} 

// // 1 => '1 item'
// // 2 => '2 items'
// Use an array of words:

// {{ count }} {{ count | pluralize(['fry', 'fries']) }} 

// // 1 => '1 fry'
// // 2 => '2 fries'
// // 3 => '3 fries'
// Include number to output:

// {{ count | pluralize('test', { includeNumber: true }) }} 

// // 1 => '1 test'
// // 2 => '2 tests'
// ordinal
// Arguments:

// {Object} [options] - default: {}
// Options:

// {Boolean} [includeNumber] - default: false
// Example:

// {{ date | ordinal }} 

// // 1 => 'st'
// // 2 => 'nd'
// // 3 => 'rd'
// // 4 => 'th'
// // 5 => 'th'
// Include number to output:

// {{ date | ordinal({ includeNumber: true }) }} 

// // 1 => '1st'
// // 2 => '2nd'
// limitBy
// Arguments:

// {Number|Array} [items]
// {Number} [limit]
// {Number} [offset]
// Example:

// <!-- only display first 10 items -->
// <div v-for="item in limitBy(items, 10)">{{ item }}</div>
// <!-- display items 5 to 15 -->
// <div v-for="item in limitBy(items, 10, 5)">{{ item }}</div>
// <!-- with a Range -->
// <div v-for="n in limitBy(10, 4, 2)">{{ n }}</div>
// filterBy
// Arguments:

// {Array} [items]
// {String} [query]
// {String} [searchKey]
// Example:

// <!-- only items that contain the target string "hello" will be displayed -->
// <div v-for="item in filterBy(items, 'hello')">
// <!-- the filter will only search for "Jack" in the name field of each user object -->
// <div v-for="user in filterBy(users, 'Jack', 'name')">
// <!-- the filter will only search for "Bonnie" in the name or age fields of each user object -->
// <div v-for="user in filterBy(users, 'Bonnie', 'name', 'age')">
// <!-- filter using a custom function -->
// <div v-for="user in filterBy(users, user => user.age > 16 && user.age < 60)">
// find
// Arguments:

// {Array} [items]
// {String} [query]
// {String} [searchKey]
// Example:

// <!-- only the first item that contains the target string "hello" will be displayed -->
// <div v-for="item in find(items, 'hello')">
// <!-- the filter will only search for "Bonnie" in the name or age fields of each user object and return the first result -->
// <div v-for="user in find(users, 'Bonnie', 'name', 'age')">
// orderBy
// Arguments:

// {Array} [items]
// {String} [sortKey]
// {Number} [order] - default: 1
// Example:

// Sort users by name:

// <ul>
//   <li v-for="user in orderBy(users, 'name')">
//     {{ user.name }}
//   </li>
// </ul>
// In descending order:

// <ul>
//   <li v-for="user in orderBy(users, 'name', -1)">
//     {{ user.name }}
//   </li>
// </ul>
// Sort primitive values:

// <ul>
//   <li v-for="name in orderBy(names, true)">
//     {{ name }}
//   </li>
// </ul>
// Global Configuration
// If you need to override filter options globally you can do so by passing an object into Vue.use() function as the second argument:

// import Vue from 'vue'
// import Vue2Filters from 'vue2-filters'

// var Vue2FiltersConfig = {
//   capitalize: {
//     onlyFirstLetter: false
//   },
//   number: {
//     format: '0',
//     thousandsSeparator: ',',
//     decimalSeparator: '.'
//   },
//   bytes: {
//     decimalDigits: 2
//   },
//   percent: {
//     decimalDigits: 2,
//     multiplier: 100,
//     decimalSeparator: '.'
//   },
//   currency: {
//     symbol: '$',
//     decimalDigits: 2,
//     thousandsSeparator: ',',
//     decimalSeparator: '.',
//     symbolOnLeft: true,
//     spaceBetweenAmountAndSymbol: false,
//     showPlusSign: false
//   },
//   pluralize: {
//     includeNumber: false
//   },
//   ordinal: {
//     includeNumber: false
//   }
// }

// Vue.use(Vue2Filters, Vue2FiltersConfig)
// Programmatic Usage
// Aside from using filters inside templates you can do this programmatically using default filters object:

// this.$options.filters.filterName(value)
// For example, here's how you can use the currencyfilter:

// this.$options.filters.currency(100) // => $100.00
// As for such filters as limitBy, filterBy, find, or orderBy, they can be used as usual methods:

// this.limitBy([1,2,3,4,5], 2) // => [1,2]