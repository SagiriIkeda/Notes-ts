export function downloadFile(name: string, content: string) {
    let elm = document.createElement('a');
    elm.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    elm.setAttribute('download', name);
    elm.style.display = 'none';
    document.body.appendChild(elm);
    elm.click();
    document.body.removeChild(elm);
}
  