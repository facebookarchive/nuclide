/// <reference path="typings/index.d.ts" />
const transformime = require('transformime');
const MarkdownTransform = require('transformime-marked');
const transform = transformime.createTransform([MarkdownTransform]);
const ResultsContainerId = 'resultsContainer';
function displayData(data, whiteBg) {
    const container = document.getElementById(ResultsContainerId);
    if (typeof data['text/html'] === 'string') {
        data['text/html'] = data['text/html'].replace(/<\/scripts>/g, '</script>');
    }
    return transform(data).then(result => {
        const div = document.createElement('div');
        div.style.display = 'block';
        div.appendChild(result.el);
        // If dealing with images add them inside a div with white background
        if (whiteBg === true || Object.keys(data).some(key => key.startsWith('image/'))) {
            div.style.backgroundColor = 'white';
        }
        return container.appendChild(div);
    });
}
window.initializeResults = (rootDirName, port, whiteBg) => {
    const results = window.JUPYTER_DATA;
    window.__dirname = rootDirName;
    try {
        let color = decodeURIComponent(window.location.search.substring(window.location.search.indexOf('?color=') + 7));
        color = color.substring(0, color.indexOf('&fontFamily='));
        if (color.length > 0) {
            window.document.body.style.color = color;
        }
        let fontFamily = decodeURIComponent(window.location.search.substring(window.location.search.indexOf('&fontFamily=') + 12));
        fontFamily = fontFamily.substring(0, fontFamily.indexOf('&fontSize='));
        if (fontFamily.length > 0) {
            window.document.body.style.fontFamily = fontFamily;
        }
        const fontSize = decodeURIComponent(window.location.search.substring(window.location.search.indexOf('&fontSize=') + 10));
        if (fontSize.length > 0) {
            window.document.body.style.fontSize = fontSize;
        }
    }
    catch (ex) {
    }
    document.getElementById('clearResults').addEventListener('click', () => {
        document.getElementById(ResultsContainerId).innerHTML = '';
    });
    try {
        if (typeof port === 'number' && port > 0) {
            var socket = window.io.connect('http://localhost:' + port);
            const displayStyleEle = document.getElementById('displayStyle');
            displayStyleEle.addEventListener('click', () => {
                socket.emit('appendResults', { append: displayStyleEle.checked });
            });
            socket.on('results', (results) => {
                if (displayStyleEle.checked !== true) {
                    document.getElementById(ResultsContainerId).innerHTML = '';
                }
                const promises = results.map(data => displayData(data, whiteBg));
                Promise.all(promises).then(elements => {
                    // Bring the first item into view
                    if (elements.length > 0) {
                        try {
                            elements[0].scrollIntoView(true);
                        }
                        catch (ex) {
                        }
                    }
                });
            });
            socket.on('clientExists', (data) => {
                socket.emit('clientExists', { id: data.id });
            });
        }
    }
    catch (ex) {
        document.getElementById('displayStyle').style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = 'Initializing live updates for results failed with the following error:\n' + ex.message;
        errorDiv.style.color = 'red';
        document.body.appendChild(errorDiv);
    }
    const promises = results.map(data => displayData(data, whiteBg));
    Promise.all(promises).then(elements => {
        // Bring the first item into view
        if (elements.length > 1) {
            try {
                elements[0].scrollIntoView(true);
            }
            catch (ex) { }
        }
    });
};
//# sourceMappingURL=main.js.map