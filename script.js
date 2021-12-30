const files = {
    'floatingPoint': './scripts/floatingPoint.js',
    'numConverter': './scripts/numConverter.js',
    'algorithms': './scripts/algorithms.js', 
    'cache': './scripts/cache.js', 
    'page': './scripts/page.js',
};

function destroyChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

async function load(file) {
    const parent = document.querySelector('.container');
    const {default: init} = await import(files[file]);
    destroyChildren(parent);
    init(parent);
}

load('numConverter');