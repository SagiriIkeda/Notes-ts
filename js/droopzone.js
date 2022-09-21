let DropZone = document.querySelector('#DropZone');
let DropCh = DropZone.querySelector('.dropzone');
let EnabledDropZone = false;
window.addEventListener('drop', ev => {
    ev.preventDefault();
    DropOutAnimation();
    if (ev.dataTransfer.items) {
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === 'file') {
          let file = ev.dataTransfer.items[i].getAsFile();
          if(file.type === "text/plain") {
            let lector = new FileReader();
            lector.readAsText(file);
            lector.onload = (u) => {
                let contenido = u.target.result;
                let name = file.name.replace(/\.txt$/im,"").substring(0,23);
                //information;
                let DefaultData = DefaultNoteGenerate();
                DefaultData.content = contenido.replace(/\n/gim,"<br/>");
                DefaultData.name = name;
                DB.Notes.Add(DefaultData);
                Application.reloadData();
            };
          }
        }
      }
    } else {
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
      }
    }
    removeDragData(ev);
})
let isAnimated = false;
let dropint;
window.addEventListener('dragover', e => {
    if(EnabledDropZone == true) {
        clearTimeout(dropint);
        e.preventDefault();
        if(isAnimated == false){
            isAnimated = true;
            //animate
            DropZone.style.display = "flex";
            DropCh.animate({opacity:1,transform:"scale(1)"},{
                duration:200,
                fill:"forwards",
                easing:"ease"
            })
            setTimeout(() => {
              window.addEventListener('dragleave',LeaveFunct);
            }, 75);
        }
    }
})
function LeaveFunct(e) {
  clearTimeout(dropint);
  if(EnabledDropZone == true){
      isAnimated = false;
      e.preventDefault();
      DropOutAnimation();
      window.removeEventListener('dragleave',LeaveFunct);
  }
}
function DropOutAnimation() {
    isAnimated = false;
    DropCh.animate({opacity:0,transform:"scale(0.9)"},{
        duration:200,
        fill:"forwards",
        easing:"ease"
    })
    dropint = setTimeout(() => {
        DropZone.style.display = "none";
    }, 200);
}
function removeDragData(ev) {
    if (ev.dataTransfer.items) {
      ev.dataTransfer.items.clear();
    } else {
      ev.dataTransfer.clearData();
    }
}
window.addEventListener('focus',e => {
    EnabledDropZone = false;
});
window.addEventListener('blur', e=> {
    EnabledDropZone = true;
});