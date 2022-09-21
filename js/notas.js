
class Notes {
    
    static ADD(text,name,identifier,folder) {


        let date = new Date();
        DB.add(text.replace(/<(\/)?searched>/gim,''),
            date.getDate(),
            date.getMonth(),
            date.getFullYear(),
            date.getHours(),
            date.getMinutes(),
            name,
            folder,
            identifier
            )
        Folders.Refresh(false);
    }
}

class Editor {
    constructor (ids,type = false) {
        let that = this;
        if(OpenEditors.find(e => e == ids) == undefined) {
            OpenEditors.push(ids)
            //create instance window
            let windowEditor = document.createElement('div');
            windowEditor.classList.add('Editor');
            windowEditor.setAttribute('identifier',ids)
            windowEditor.innerHTML = /*html*/`
            <div class="window">
            <div class="title">
                <img src="icon.jpg" alt="editor">
                <span>[note__name]</span>
            </div>
            <div class="btns">
                <div class="wbtn"><i class="material-icons">close</i></div>
            </div>
        </div>
        <div class="usereditor">
            <div class="note-editor-capm">
                <div class="editor-header">
                    <div class="atras">  <i class="material-icons"> keyboard_arrow_left</i></div>
                    <div class="note_name">
                        <div class="container">
                            <div class="saved">Guardando...</div>
                            <div class="name" contenteditable="true">[note__name]</div>
                        </div>
                    </div>
                    <div class="lefting-part">
                        <div class="OpenSubMenu"> <i class="material-icons">title</i></div>
                        <div class="save">  <i class="material-icons">done</i></div>
                    </div>
                </div>
                <div class="note-editor">
                    <div class="note-data">1970 Abr 20 7:00PM | 0 characters</div>
                    <div class="note-capm" contenteditable="true"> [text__content]</div>
                    <div class="selected_capm">
                        <span class="titles" >Seleccione estilo...</span>
                        <div class="div">
                            <button class="item" property="bold"><span class="material-icons">format_bold</span></button>
                            <button class="item" property="underline"><span class="material-icons">format_underlined</span></button>
                            <button class="item" property="italic"><span class="material-icons">format_italic</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="expandiblewindow"></div>
            `;
            document.querySelector('.editors').appendChild(windowEditor);

            //tab for window instance
            let tabsContainer = document.querySelector('.activeEditors')
            let tab = document.createElement('div');
            tab.classList.add('editortab')
            tab.innerHTML = `
            <div class="icon">  <img src="icon.jpg" alt="editor"> </div>
            <span>Notas</span>
            <i class="material-icons">close</i>
            `;
            
            tab.addEventListener('click', setActualEditor)

            let actualinterval;

            function setActualEditor() {
                clearInterval(actualinterval);
                document.querySelector('.editors').appendChild(windowEditor);
                windowEditor.classList.add('noanimation')
            }

            let tabtext = tab.querySelector('span');
            tabsContainer.appendChild(tab)
            if(window.matchMedia("(min-width: 500px)").matches) {
            }else {
                windowEditor.classList.add('init')
            }

            //vars
            let editor = windowEditor.querySelector('.note-editor-capm'),
                note__header = editor.querySelector('.editor-header'),
                    header_atras = note__header.querySelector('.atras'),
                    header_opensubmenu = note__header.querySelector('.OpenSubMenu'),
                    header_save = note__header.querySelector('.save'),
                    header_note_name = note__header.querySelector('.note_name'),
                        note_name_container = header_note_name.querySelector('.container'),
                            note_name = note_name_container.querySelector('.name'),
                note__editor = editor.querySelector('.note-editor'),
                    note__info = note__editor.querySelector('.note-data'),
                    note__camp = note__editor.querySelector('.note-capm');

            //editor Bold underlined etc...
                let content_options = editor.querySelector('.selected_capm');
                    let property = content_options.querySelectorAll('.item');
            // window vars
            let windowname = windowEditor.querySelector('.window .title span');
            let windowclosebtn = windowEditor.querySelector('.window .btns .wbtn');
            let windowcontainer = windowEditor.querySelector('.window');
            let rezizebtn = windowEditor.querySelector('.expandiblewindow')
            let usereditor = windowEditor.querySelector('.usereditor')
            //tabs
            let tab__closebtn = tab.querySelector('i');
            //functionality
            let id = ids;
            let el;
            if(type == false){
                el = DB.ReloadData().find(nota => nota.identifier === ids);
            }else {
                let date = new Date();
                el = {
                    name:"note",
                    content:"Write Here...",
                    time: {
                        day:date.getDate(),
                        month:date.getMonth(),
                        year:date.getFullYear(),
                        hour:date.getHours(),
                        minute:date.getMinutes(),
                    },
                    folder: Folders.actualfolder
                }
            }

            if(Search.actualsearch.trim()){
                let regex = new RegExp(`${Search.actualsearch}`,'gim')
                el.content = el.content.replace(regex,'<searched>$&</searched>');
            }
            let time = `${el.time.year} ${months[el.time.month]} ${(el.time.hour >= 13)? el.time.hour - 12 : el.time.hour}:${(el.time.minute <= 9)? "0" + el.time.minute :el.time.minute} ${(el.time.hour >= 12)? "PM": "AM"}`;
            let charat = ` | ${el.content.replace(/<.*?>/gim,'').length} caracteres`

            //protecion unsave
            let lastsabe = el.content;

            windowname.innerHTML = el.name;
            // editor.classList.add('active')
            // windowEditor.classList.add('active')
            note__camp.focus();
            note_name.addEventListener('keydown',WritenRename)

            function WritenRename(e) {
                if(e.keyCode == 116){
                    saver();
                    note__camp.click()
                    e.preventDefault()
                }
            }

            let pos1 = 0,
                pos2 = 0,
                pos3 = 0,
                pos4 = 0
            
            windowcontainer.addEventListener('mousedown',DragWindow);
            function DragWindow(e) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.addEventListener('mouseup',closeDragElement)
                document.addEventListener('mousemove',elementDrag)
                // call a function whenever the cursor moves:
                if(e.path[0] != windowclosebtn){
                    setActualEditor();
                }
                function elementDrag(e) {
                    e.preventDefault();
                    // calculate the new cursor position:
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;

                    let dy = windowEditor.offsetTop - pos2;
                    let dx = windowEditor.offsetLeft - pos1;

                    let pagewidth = document.documentElement.scrollWidth;
                    let pageheight = document.documentElement.scrollHeight;
                    
                    let width = windowEditor.getBoundingClientRect().width;
                    let height = windowEditor.getBoundingClientRect().height;

                    if(dy + height  > pageheight) dy = pageheight - height;
                    if(dy < 0) dy = 0;
                    if(dx + width > pagewidth) dx = pagewidth - width;
                    if(dx < 0) dx = 0;
                    // set the element's new position:
                    windowEditor.style.top = `${dy}px`;
                    windowEditor.style.left = `${dx}px`;

                    let rect = windowEditor.getBoundingClientRect();

                    let wswidth = rect.width
                    let wsheight = rect.height;
                    let wsleft = rect.left;
                    let wstop = rect.top

                    that.DBW().set(ids,wswidth,wsheight,wstop,wsleft);
                }

                function closeDragElement(e) {
                    document.removeEventListener('mouseup',closeDragElement)
                    document.removeEventListener('mousemove',elementDrag)
                }
            }

            let Resource__data = time + charat;    

            tabtext.innerHTML = el.name;
            note__info.innerHTML = Resource__data;
            note__camp.innerHTML = el.content;
            note_name.innerHTML = el.name;
            note__camp.addEventListener('keydown', UPDATECHARAT)

            tab__closebtn.addEventListener('click', CloseEditor)
            windowclosebtn.addEventListener('click', CloseEditor)
            header_atras.addEventListener('click', CloseEditor)

            header_save.addEventListener('click',saver)

            note_name.addEventListener('keydown',UPDATENAME);

            windowEditor.addEventListener('keydown',f5);

            rezizebtn.addEventListener('mousedown',rezize)

            note_name.addEventListener('paste',preventPasteHTML)
            note__camp.addEventListener('paste',preventPasteHTML)

            function preventPasteHTML(e) {
                e.preventDefault();
                let text = e.clipboardData.getData("text/plain");
                document.execCommand('insertText', false, text);
            }

            function rezize(e) {
                let initialY = e.clientY;
                let initialX = e.clientX;

                document.addEventListener('mouseup',up)
                document.addEventListener('mousemove',changet)
                let maxscreenw = document.documentElement.scrollWidth;
                let maxscreenh = document.documentElement.scrollHeight;


                function changet(e) {
                    let ny = e.clientY;
                    let nx = e.clientX;

                    let rect = windowEditor.getBoundingClientRect();

                    let wetop = rect.top;
                    let weleft = rect.left;

                    let width = nx - weleft;
                    let height = ny - wetop;

                    let top = rect.top;
                    let left = rect.left;
                    
                    let minheight = 200;
                    let minwidth = 360;

                    if(height < minheight) height = minheight; 
                    if(width < minwidth) width = minwidth;
                    
                    windowEditor.style.maxHeight = `${maxscreenh - top}px`;
                    windowEditor.style.maxWidth = `${maxscreenw - left}px`;

                    windowEditor.style.height =  `${height}px`;
                    windowEditor.style.width =  `${width}px`;

                    that.DBW().set(ids,width,height,top,left);

                }
                function up() {
                    MaxCampHeight();
                    document.removeEventListener('mousemove',up)
                    document.removeEventListener('mousemove',changet)

                }
            }

            window.addEventListener('resize',MaxCampHeight)
            header_opensubmenu.addEventListener('click',ForzeOpenMenuPropertiesMenu)
            function ForzeOpenMenuPropertiesMenu(e) {
                content_options.classList.toggle('forze')
            }

            // selection events
            let timetorange;
            function getSelectionHtml() {
                var html = "";
                if (typeof window.getSelection != "undefined") {
                    var sel = window.getSelection();
                    if (sel.rangeCount) {
                        var container = document.createElement("div");
                        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                            container.appendChild(sel.getRangeAt(i).cloneContents());
                        }
                        html = container.innerHTML;
                    }
                } else if (typeof document.selection != "undefined") {
                    if (document.selection.type == "Text") {
                        html = document.selection.createRange().htmlText;
                    }
                }
                return html;
            }
            document.addEventListener('selectionchange', SelectionChange)

            function SelectionChange(e) {
                if(e.path[0].activeElement == note__camp){
                    clearInterval(timetorange);
                    let range = document.getSelection().toString();
                    function IdentifierPropertis(e) {
                        let html = getSelectionHtml()
                        let BoldBtn = content_options.querySelector('.item[property="bold"]');
                        let UnderlineBtn = content_options.querySelector('.item[property="underline"]');
                        let italicBtn = content_options.querySelector('.item[property="italic"]');
                        
                        let parenttag = document.getSelection().anchorNode.parentNode.tagName;
            
                        if(html.search(/<i>.*?<\/i>/gim) != -1 || parenttag == "I") {
                            italicBtn.classList.add('active')
                        }else {
                            italicBtn.classList.remove('active')
                        }

                        if(html.search(/<u>.*?<\/u>/gim) != -1 || parenttag == "U") {
                            UnderlineBtn.classList.add('active')
                        }else {
                            UnderlineBtn.classList.remove('active')
                        }

                        if(html.search(/<b>.*?<\/b>/gim) != -1 || parenttag == "B") {
                            BoldBtn.classList.add('active')
                        }else {
                            BoldBtn.classList.remove('active')
                        }

                        if(parenttag == "B" || parenttag == "I" || parenttag == "U") {
                            let actualparent = document.getSelection().anchorNode.parentNode;
                            let array = [];
                            let tag = actualparent.tagName;
                            array.push(tag)
                            if(actualparent.parentNode.tagName != "DIV") {
                                array.push(actualparent.parentNode.tagName)
                                if(actualparent.parentNode.parentNode.tagName != "DIV") {
                                    array.push(actualparent.parentNode.parentNode.tagName)
                                }
                            }
                            array.forEach(prop => {
                                if(prop == "I") {
                                    italicBtn.classList.add('active')
                                }
                                if(prop == "U") {
                                    UnderlineBtn.classList.add('active')
                                }
                                if(prop == "B") {
                                    BoldBtn.classList.add('active')
                                }
                            })
                        }
                    }
                    if(range.length != 0) {
                        let ms = 0;
                        timetorange = setInterval(() => {
                            ms++;
                            if(ms >= 100) {
                                clearInterval(timetorange);
                                content_options.classList.add('active');
                                ms = 0;
                            }
                        }, 1);
                        
                    }else {
                        content_options.classList.remove('active')
                    }
                    IdentifierPropertis();
                }
            }

            function f5(e) {
                if(e.keyCode == 116){
                    e.preventDefault();
                }
                
            }

            function UPDATECHARAT (e) {
                charat = ` | ${note__camp.innerHTML.replace(/<.*?>/gim,'').length} caracteres`;
                Resource__data = time + charat;     
                note__info.innerHTML = Resource__data;

                if(e.keyCode == 116){
                    e.preventDefault();
                    saver();
                }
            }

            function UPDATENAME(e) {
                let text = note_name.innerHTML;
                if(text.length >= 21) {
                    let select = document.getSelection();
                    let mismocontenedor = false;
                    if(select.anchorNode.parentNode == note_name) {
                        mismocontenedor = true
                    }
                    if(e.keyCode != 8 && select.toString().length == 0 && mismocontenedor == true) {
                        e.preventDefault()
                    }
                }
                tabtext.innerHTML = note_name.innerHTML
                windowname.innerHTML = note_name.innerHTML;
            }

            function saver() {
                lastsabe = note__camp.innerHTML;
                Save(note__camp.innerHTML,note_name.innerHTML.substr(0,21))
            }
            function Save(Note,Name) {
                if(type == false){
                    DB.remove(DB.ReloadData().findIndex(nota => nota.identifier === ids));
                }
                Notes.ADD(Note,Name,ids,el.folder);
                savingAnimation();
                type = false;
            }
            
            property.forEach(p => {
                let typ = p.getAttribute('property');
                p.querySelector('span').setAttribute('property',typ);
                p.addEventListener('click', Texturize)
                
            })

            function Texturize(e) {
                document.execCommand(e.path[0].getAttribute('property'),false,null)
            }

            function CloseEditor(force = false){
                if(force != true) {
                    if(lastsabe != note__camp.innerHTML) {
                        swal.fire({
                            icon: 'warning',
                            html: 'Aún no haz guardado<br> <b>¿estas seguro que deseas cerrar?</b>',
                            confirmButtonText: 'cerrar'
                        }).then((result) => {
                            if (result.isConfirmed) {
                              Close()
                            }
                        })
                    }else {
                        Close();
                    }
                }else {
                    Close()
                }
                function Close() {
                    if(window.matchMedia("(min-width: 500px)").matches) {
                        windowEditor.animate([
                            {transform: `scale(1)`,opacity: "1"},
                            {transform: `scale(0.8)`, opacity: "0"},
                        ],{
                            duration: 300,
                            easing: "ease",
                            fill: "forwards",
                        })
                    }else {
                        windowEditor.animate([
                            {transform: `translateX(100%)`},
                        ],{
                            duration: 300,
                            easing: "ease",
                            fill: "forwards",
                        })
                    }
                    delete windowEditor.CloseEditor;
                    let editor = windowEditor.querySelector('.note-editor-capm')
                        // editor.classList.remove('active')
                        // windowEditor.classList.remove('active')
                        header_opensubmenu.removeEventListener('click',ForzeOpenMenuPropertiesMenu)
                        document.removeEventListener('selectionchange', SelectionChange)
                        tab.removeEventListener('click',setActualEditor)
                        window.removeEventListener('keydown',MaxCampHeight)
                        windowEditor.removeEventListener('keydown',f5)
                        note__camp.removeEventListener('keyup', UPDATECHARAT)
                        header_save.removeEventListener('click', saver)
                        tab__closebtn.removeEventListener('click', CloseEditor)
                        windowclosebtn.removeEventListener('click', CloseEditor)
                        header_atras.removeEventListener('click', CloseEditor)
                        note_name.removeEventListener('keydown',WritenRename)
                        note_name.removeEventListener('keyup',UPDATENAME);
                        windowcontainer.removeEventListener('mousedown',DragWindow);
                        note_name.removeEventListener('paste',preventPasteHTML)
                        note__camp.removeEventListener('paste',preventPasteHTML)
                        property.forEach(p => {
                            p.removeEventListener('click',Texturize)
                        })
                    
                        tabsContainer.removeChild(tab);
                    setTimeout(() => {
                        OpenEditors.splice(OpenEditors.findIndex(e => e == ids),1)
                        document.querySelector('.editors').removeChild(windowEditor)
                        delete this;
                    }, 300);
                }
            }

            windowEditor.CloseEditor = force => CloseEditor(force);

            function savingAnimation() {
                note_name_container.classList.add('saving')
                setTimeout(() => {
                    note_name_container.classList.remove('saving')
                    
                }, 1000);
            }

            if(that.DBW().get(ids) != false) {
                let vals = that.DBW().get(ids);
                windowEditor.style.height =  `${vals.height}px`;
                windowEditor.style.width =  `${vals.width}px`;
                windowEditor.style.left =  `${vals.left}px`;
                windowEditor.style.top =  `${vals.top}px`;
            }else {
                let rect = windowEditor.getBoundingClientRect();

                let wheight = document.documentElement.scrollHeight;
                let wwidth = document.documentElement.scrollWidth;

                let left = (wwidth / 2) - ((rect.width * 1.25) / 2);
                let top = (wheight / 4) - ((rect.height) / 2);

                windowEditor.style.left =  `${left}px`;
                windowEditor.style.top =  `${top}px`;

            }
            
            function MaxCampHeight() {
                let usereditorheight = usereditor.getBoundingClientRect().height;

                let characterheight = note__info.getBoundingClientRect().height;
                let editorheaderHeight = note__header.getBoundingClientRect().height;

                let avaibleHeight = usereditorheight - characterheight - editorheaderHeight;

                avaibleHeight -= 1;

                note__camp.style.maxHeight = `${avaibleHeight}px`; 
            }
            setTimeout(() => {
                MaxCampHeight();
            }, 350);
        }
        that.DBW().unused();
    }

    DBW(){
        let Db = [];
        if(localStorage.getItem('width')){
            Db = JSON.parse(localStorage.getItem('width'));
        }
        
        function set(identifier,width,height,top,left) {
            if(Db.find(elm => elm.identifier == identifier)){
                let element = Db[Db.findIndex(elm => elm.identifier == identifier)];

                element.top = top;
                element.left = left;
                element.width = width;
                element.height = height;

            }else {
                Db.push({identifier: identifier,
                        width: width,
                        height: height,
                        top: top,
                        height: height});
            }
            save();
        }
        function unused() {
            Db.forEach(data => {
                if(!DB.ReloadData().find(el => el.identifier == data.identifier)){
                    remove(data.identifier)
                }
            })
        }
        function remove(identifier) {
            if(Db.find(elm => elm.identifier == identifier)){
                Db.splice(Db.findIndex(elm => elm.identifier == identifier),1); 
                save();
            }
        }

        function get(identifier) {
            if(Db.find(elm => elm.identifier == identifier)){
                let element = Db[Db.findIndex(elm => elm.identifier == identifier)];

                return element;
            }else {
                return false;
            }
        }

        function save() {
            localStorage.setItem('width',JSON.stringify(Db));
        }

        return {
            set: (identifier,width,height,top,left) => set(identifier,width,height,top,left),
            get: identifier => get(identifier),
            unused: e => unused()
        }

    }
}



let NEW_NOTE_BUTTON = document.querySelector('.addButton');
NEW_NOTE_BUTTON.addEventListener('click',e => {
    newNote();
})
function newNote() {
    new Editor(`${new Date().getTime()}-${DB.ReloadData().length}`,true)
}