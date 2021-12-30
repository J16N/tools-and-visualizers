/*
 * Markup Structure
 *
 * Converter
 *     Output Container
 *        Output One
 *        Output Two
 * 
 *     Input  Container
 *        Input Buttons
 */


export default function (parent) {
    const converter = document.createElement('div');
    converter.classList.add('num-converter');

    const outputContainer = document.createElement('div');
    outputContainer.classList.add('output-container');

    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    parent.appendChild(converter);
}