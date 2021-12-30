export default function (parent) {
    const converter = document.createElement('div');
    converter.classList.add('num-converter');

    const outputs = document.createElement('div');

    parent.appendChild(converter);    
}