const scaleFactor = 1.5;
const keypad = [
    'AC', 'del', 'F', 'E',
    '7', '8', '9', 'D',
    '4', '5', '6', 'C',
    '1', '2', '3', 'B',
    '.', '0', '=', 'A',
];
const bodyFontSize = window.getComputedStyle(document.body).fontSize.slice(0, -2);
const state = {
    el: null,
    currOutput: null,
};
const digitsLetter = {
    10: 'A', 11: 'B',
    12: 'C', 13: 'D',
    14: 'E', 15: 'F',
};
const letterDigits = Object.assign(
    {}, ...Object.entries(digitsLetter)
                 .map(([a,b]) => ({ [b]: a }))
);
const keys = {};

const _initButtons = el => {
    for (let key of keypad) {
        const input = document.createElement('div');
        input.classList.add('no-select');
        input.textContent = key;
        input.dataset.key = key;

        if (key === 'del') {
            input.classList.add('material-icons');
            input.textContent = 'backspace';
        }

        if (!['AC', 'del', '=', '.'].includes(key)) {
            input.setAttribute('disabled', 'true');
            keys[key] = input;
        }

        input.addEventListener('click', updateOutput);
        el.appendChild(input);
    }
};

const _initSelectables = el => {
    for (let i = 2; i <= 16; i++) {
        const select = document.createElement('div');
        select.classList.add('no-select');
        select.textContent = `Base ${i.toString().padStart(2, '0')}`;
        select.addEventListener('click', base);
        el.appendChild(select);
    }
};

const clearOutput = () => {
    const outputs = document.querySelectorAll('.output-container > .output-box');

    for (let output  of outputs) {
        output.textContent = 0;
        output.style.fontSize = `${3 * bodyFontSize}px`;
        output.style.textAlign = 'right';
        output.style.justifyContent = 'center';
    }
};

const deleteOutput = el => {
    if (el.textContent === '0')
        return;
        
    el.textContent = el.textContent.slice(0, -1);
    // Remove newlines from start and end of string
    el.textContent = el.textContent.replace(/^\s+|\s+$/g, '');
    
    if ( !el.textContent.includes('\n') ) {
        el.style.textAlign = 'right';
        el.style.justifyContent = 'center';
    }

    // Increase font size and check if the output is getting 
    // scrollable. If it is, decrease the font size.
    el.style.fontSize = `${3 * bodyFontSize}px`;
    if (el.clientWidth < el.scrollWidth)
        el.style.fontSize = `${bodyFontSize * 3 / scaleFactor}px`;
    
    if (!el.textContent)
        el.textContent = 0;
};

const removeActiveOutput = e => {
    const currentActiveOutputs = document.querySelectorAll('.active-output');
    for (let activeOutput of currentActiveOutputs)
        activeOutput.classList.remove('active-output');
    
    return currentActiveOutputs;
};

const activeOutput = e => {
    if (e.target.classList.contains('active-output'))
        return;

    const currentActiveOutputs = removeActiveOutput(e);

    let el = state.currOutput;
    if (currentActiveOutputs.length > 0)
        el = e.target;
    
    el.classList.add('active-output');
    el.previousSibling.classList.add('active-output');
    state.currOutput = el;
    validateInput(el.previousSibling);
};

const update = (el, text) => {
    if (el.textContent === '0' && text !== '.') {
        el.textContent = text;
        return;
    }

    el.textContent += text;

    if (el.clientWidth < el.scrollWidth) {
        let currFontSize = +window.getComputedStyle(el).fontSize.slice(0, -2);

        if (currFontSize > bodyFontSize * 3 / scaleFactor) {
            el.style.fontSize = `${currFontSize / scaleFactor}px`;
            return;
        }

        el.style.textAlign = 'left';
        el.style.justifyContent = 'start';
        el.textContent = (
            el.textContent.slice(0, -1) + '\n' + el.textContent.slice(-1)
        );
        el.scrollTop = el.scrollHeight;
    }
};

const updateOutput = e => {
    const activeOutput = document.querySelector('.output-box.active-output');
    const inactiveOutput = document.querySelector('.output-box:not(.active-output)');
    const tbaseEl = document.querySelector('.select:not(.active-output)');
    const fbaseEl = document.querySelector('.select.active-output');

    switch (e.target.textContent) {
        case 'AC':
            clearOutput();
            break;

        case 'backspace':
            deleteOutput(activeOutput);
            break;

        case '=':
            const fbase = getBase(fbaseEl);
            const tbase = getBase(tbaseEl);
            const ans = convertToBase(activeOutput.textContent, fbase, tbase);
            console.log(ans);
            
            while (inactiveOutput.textContent !== '0')
                deleteOutput(inactiveOutput);

            for (let digit of ans)
                update(inactiveOutput, digit);
            
            break;

        default:
            update(activeOutput, e.target.textContent);
            break;
    }
};

const getBase = el => Number(el.textContent.match(/\d{2}/g)[0]);

const validateInput = el => {
    const base = getBase(el);

    for (let i = 0; i < 16; i++)
        keys[digitsLetter[`${i}`] ?? i].setAttribute('disabled', 'true');

    for (let i = 0; i < base; i++)
        keys[digitsLetter[`${i}`] ?? i].removeAttribute('disabled');
};

const toggleSelectables = el => {
    const selectable = document.querySelector('.select-container');
    state.el = selectable.classList.contains('enter') ? null : el;
    selectable.classList.toggle('enter');
    blurBackground('toggle');
};

const closeSelectables = e => {
    const selectable = document.querySelector('.select-container');
    selectable.classList.remove('enter');
    blurBackground('remove');
};

document.addEventListener('click', e => {
    const triggers = [
        document.querySelector('div.button'),
        ...document.querySelectorAll('.select')
    ];
    if (triggers.includes(e.target) || triggers.includes(e.target.parentElement)) {
        toggleSelectables(e.target.classList.contains('select') ? 
            e.target : e.target.parentElement);
        return;
    }

    if (e.target.parentElement === document.querySelector('.select-container'))
        return;

    closeSelectables(e);
});

const blurBackground = action => {
    const outputContainer = document.querySelector('.output-container');
    const inputContainer = document.querySelector('.input-container');

    outputContainer.classList[action]('blur');
    inputContainer.classList[action]('blur');
};

const base = e => {
    const number = e.target.textContent.split(' ')[1];
    state.el.innerHTML = state.el.innerHTML.replace(/\d{2}/g, number);
    closeSelectables(e);
    validateInput(state.el);
};

const convertToBase = (num, fbase, tbase) => {
    if (num === '0' || fbase === tbase)
        return num;

    if (tbase === 10) {
        const [intPart, fracPart] = num.split('.');
        let ans = 0;
        let pos = intPart.length - 1;
        for (let d of intPart)
            ans += (letterDigits[d] ?? +d) * Math.pow(fbase, pos--);

        if (fracPart) {
            for (let i = 1; i <= fracPart.length; i++) {
                let d = fracPart[i - 1];
                ans += (letterDigits[d] ?? +d) * Math.pow(fbase, -i);
            }
        }

        return ans.toString();
    }

    if (fbase !== 10)
        num = convertToBase(num, fbase, 10);

    let ans = [];
    let intPart = parseInt(num);
    let fracPart = Number(num) - intPart;

    while (intPart > 0) {
        let d = intPart % tbase;
        ans.unshift(digitsLetter[`${d}`] ?? d);
        intPart = Math.floor(intPart / tbase);
    }

    if (fracPart) {
        ans.push('.');

        for (let place = 0; fracPart > 0 && place < 64; place++) {
            let decimalNum = fracPart * tbase;
            let int = Math.floor(decimalNum);
            ans.push(digitsLetter[`${int}`] ?? int);
            fracPart = Math.round((decimalNum - int + Number.EPSILON) * 10000) / 10000;
        }
    }

    return ans.join('');
};


export default function (parent) {
    // Main calculator app container
    const converter = document.createElement('div');
    converter.classList.add('num-converter');
    converter.setAttribute('tabindex', '1');
    converter.addEventListener('focusin', activeOutput);
    converter.addEventListener('focusout', removeActiveOutput);


    // Output container of calculator
    const outputContainer = document.createElement('div');
    outputContainer.classList.add('output-container');


    // Input container of calculator
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');


    // Output Container's children. This includes two output boxes
    // and two select boxes. Created and initialized with the event
    // listeners.
    const firstOutput = document.createElement('div');
    const secondOutput = document.createElement('div');
    firstOutput.classList.add('output-box');
    secondOutput.classList.add('output-box');
    state.currOutput = secondOutput;
    firstOutput.addEventListener('click', activeOutput);
    secondOutput.addEventListener('click', activeOutput);
    
    const firstOutpSel = document.createElement('div');
    const secondOutpSel = document.createElement('div');
    firstOutpSel.classList.add('select', 'no-select');
    secondOutpSel.classList.add('select', 'no-select');

    firstOutpSel.textContent = 'B-02';
    secondOutpSel.textContent = 'B-16';

    const firstSelectIcon = document.createElement('span');
    const secondSelectIcon = document.createElement('span');

    firstSelectIcon.classList.add('material-icons');
    secondSelectIcon.classList.add('material-icons');

    firstSelectIcon.textContent = 'arrow_drop_down';
    secondSelectIcon.textContent = 'arrow_drop_down';

    firstOutpSel.appendChild(firstSelectIcon);
    secondOutpSel.appendChild(secondSelectIcon);

    outputContainer.appendChild(firstOutpSel);
    outputContainer.appendChild(firstOutput);
    outputContainer.appendChild(secondOutpSel);
    outputContainer.appendChild(secondOutput);


    // Create input buttons of calculator.
    _initButtons(inputContainer);
    validateInput(secondOutpSel);

    const selectContainer = document.createElement('div');
    selectContainer.classList.add('select-container');
    
    const selectHead = document.createElement('div');
    selectHead.classList.add('no-select');
    selectHead.textContent = 'Select Numeral System';

    const selectBody = document.createElement('div');
    _initSelectables(selectBody);

    const selectFoot = document.createElement('div');
    const cancelButton = document.createElement('div');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('no-select', 'button');
    selectFoot.appendChild(cancelButton);

    selectContainer.appendChild(selectHead);
    selectContainer.appendChild(selectBody);
    selectContainer.appendChild(selectFoot);


    // Append all the elements to the main container.
    converter.appendChild(outputContainer);
    converter.appendChild(inputContainer);
    converter.appendChild(selectContainer);

    converter.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === 'Enter') {
            const el = document.querySelector('.select.active-output');
            toggleSelectables(el);
        }

        switch(e.key) {
            case 'Escape':
                closeSelectables(e);
                break;
    
            case 'ArrowUp':
            case 'ArrowDown':
                console.log(`hi`);
                break;

            case 'Enter':
                break;

            case 'Backspace':
                break;

            case 'Delete':
                break;

            
        }
    });


    parent.appendChild(converter);


    // Clear the output of the calculator.
    clearOutput();
    converter.focus();
}