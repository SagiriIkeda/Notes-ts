//SelectMode

class SelectMode {
    static Active() {
        SelIndicate.style.display = null;
        let notes = document.querySelectorAll('.note-preview');
        notes.forEach(nt => {
            nt.classList.add('selectmode');
        })
        
        selectbox.classList.add('active')
        // document.querySelector('.superspace').style.display = null;
        selectmode = true;
    }
    static getSelectes() {
        let notes = document.querySelectorAll('.note-preview');
        let identifiers = [];
        notes.forEach(nt => {
            if(nt.querySelector('.select').classList.contains("active")) {
                identifiers.push([nt.getAttribute("identifier"),nt]);
            }
        })
        return identifiers
    }
    static DisableMode() {
        let notes = document.querySelectorAll('.note-preview');
        notes.forEach(nt => {
            nt.classList.remove('selectmode');
            nt.querySelector('.select').classList.remove('active')
        })
        selectbox.classList.remove('active')
        selectmode = false;
        SelIndicate.style.display = "none";
        if(document.querySelector('.superspace')){
            document.querySelector('.superspace').style.display = "none";
        }
    }
    static RemoveSelectes() {
        let total = this.getSelectes();
        let bezier = 'cubic-bezier(0.230, 1.000, 0.320, 1.000)';

        Swal.fire({
            title: 'Estas Seguro?',
            text: "Una vez borradas no hay forma de recuperarlas!",
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Borrar',
            icon: 'warning'
          }).then((result) => {
            if (result.isConfirmed) {
                total.forEach(data => {
                    let note = data[1];
                    let identifier = data[0];
                    DB.SecureRemove(identifier);
                    if(document.querySelector(`.Editor[identifier="${identifier}"]`)){
                        document.querySelector(`.Editor[identifier="${identifier}"]`).CloseEditor(true);
                    }

                    note.animate({
                        transform: `scale(0.7)`,
                        opacity: "0"
                    },{
                        duration: 500,
                        easing: bezier,
                        fill: "forwards",
                    })
                    setTimeout(() => {
                        Folders.Refresh(false);
                    }, 501);
                })
                this.DisableMode();
            }
        })

    }
    static NumSelectes(){
        let notes = document.querySelectorAll('.note-preview');
        let num = 0;

        notes.forEach(nt => {
            if(nt.querySelector('.select').classList.contains("active")) {
                num += 1
            }
        })
        return num;
    }
    static SelectAll() {
        let notes = document.querySelectorAll('.note-preview');
        let status = []
        notes.forEach(nt => {
            if(nt.querySelector('.select').classList.contains('active')){
                status.push(true)
            }else {
                status.push(false)
            }

        })
        if(status.every(st => st == true) == true ) {
            notes.forEach(nt => {
                nt.classList.add('selectmode');
                nt.querySelector('.select').classList.remove('active')
                document.querySelector('.selbtn').style.color = null;
            })
           
        }else {
            notes.forEach(nt => {
                document.querySelector('.selbtn').style.color = "#f88706";
                nt.classList.add('selectmode');
                nt.querySelector('.select').classList.add('active')
    
            })
        }

        let numsels = document.querySelector('.numsels');
        numsels.innerHTML = `${SelectMode.NumSelectes()} Notas Seleccionadas`
    }
    static totalNotes() {
        let notes = document.querySelectorAll('.note-preview');
        let num = 0;

        notes.forEach(nt => {
            num += 1
        })
        return num;
    }
}
//variables
let selectmode = false;
let first = true;
let selectbox = document.querySelector('.SelectBox');
let SelIndicate = document.querySelector('.selectedIndicate');
SelIndicate.style.display = "none";

let OpenEditors = [];
// Folders
class FoldersClass {
    constructor () {
        this.DB()
        this.actualfolder = this.DB().get()[0];
        if(localStorage.getItem('LastFolder')) {
            this.actualfolder = localStorage.getItem('LastFolder');
        }

        this.Refresh();
        this.menu = document.querySelector('.folderSection')
        this.menu.style.display = "none";


        this.notetab = document.querySelector('.NoteTab');

        this.notetab.addEventListener('click', e => {
            if(this.notetab.classList.contains('active')){
                this.OpenMenu();
            }
        })

        this.isMenuOpen = false;
        this.NotesDB = DB;

    }
    DB() {
        let NDB = this.NotesDB;
        let DB = [];
        let lc = localStorage.getItem('Notas');
        if(lc != undefined) {
            DB = JSON.parse(lc);
        }else {
            DB = ["Notas"]
            localStorage.setItem('Notas',JSON.stringify(DB))
        }
        function add (folder) {
            if(DB.find(lt => lt == folder)){
                console.error('ya existe una carpeta con ese nombre')
                return false;
            }else {
                DB.push(folder)
                localStorage.setItem('Notas',JSON.stringify(DB))
                return true;
            }
        }
        function remove(folder) {
            if(folder != "Notas"){
                DB.splice(DB.findIndex(el => el == folder),1); 
                NDB.ReloadData().filter(nota => nota.folder == folder).forEach(nota => {
                    NDB.SecureRemove(nota.identifier);
                })
                if(localStorage.getItem('LastFolder')){
                    localStorage.setItem('LastFolder',DB[0]);
                }
                
                localStorage.setItem('Notas',JSON.stringify(DB))
                return true
            }else {
                console.error('No se puede Eliminar la Carpeta Principal...')
                return false
            }
        }
        function get() {
            return DB
        }
        return {
            add: e => add(e),
            get: e => get(e),
            remove: e => remove(e)
        }
    }
    Refresh(firstanimation = true) {

        first = firstanimation;
        let folderSection = document.querySelector('.folderSection');
        let foldermenufather = document.querySelector('.foldersMenu')
        foldermenufather.innerHTML = `<div class="container"><h2>Carpetas</h2></div>`;
        let folderMenu = document.querySelector('.foldersMenu .container');
        folderSection.innerHTML = "<div class='container'></div>";
        let container = folderSection.querySelector('.container')
        let that = this;

        let ContainerPc = document.querySelector('.foldersMenu .container');

        this.DB().get().forEach(folder => {
            let fl = document.createElement('div');
            fl.classList.add('folder');
            fl.folder = folder;
            let CantidadNotas = DB.ReloadData().filter(data => data.folder == folder).length;
            fl.innerHTML = `<span class="textd" ><i class="material-icons">arrow_forward_ios</i>${folder}</span>${CantidadNotas}`
            
            let flpc = document.createElement('div');
            flpc.classList.add('folder');
            flpc.folder = folder;
            flpc.innerHTML = `<span class="textd" ><i class="material-icons">arrow_forward_ios</i>${folder}</span>${CantidadNotas}`


            container.appendChild(fl);

            ContainerPc.appendChild(flpc);

            function deletefolder(params) {
                Swal.fire({
                    icon: 'warning',
                    html: `Desea Borrar la carpeta <b>${fl.folder}</b>`,
                    confirmButtonText: "borrar"
                }).then((result) => {
                    if (result.isConfirmed) {
                        if(that.DeleteFolder(fl.folder)){
                            Swal.fire({
                                icon: 'success',
                                html: `Carpeta Borrada!`,
                                confirmButtonText: "ok"
                            })
                        }else {
                            Swal.fire({
                                icon: 'error',
                                html: `Ocurrio un Error!`,
                                confirmButtonText: "ok"
                            })
                        }
                    }
                })
            }


            flpc.addEventListener('touchstart', e => {
                let ms = 0;
                let timer = 50
                let inte = setInterval(() => {
                    if(ms >= timer && fl.folder != "Notas") {
                        deletefolder()
                        clearInterval(inte)
                    }
                    ms += 1;
                }, 10);
                function uped(u) {
                    clearInterval(inte)
                    if(ms < timer) {
                        if(fl != folderMenu.querySelector('.folder.active')){
                            that.SelFolder(fl.folder);
                            that.CloseMenu();
                        }
                    }
                    flpc.removeEventListener('touchend',uped)
                }
                flpc.addEventListener('touchend',uped)
            })
            flpc.addEventListener('mousedown', e => {
                let ms = 0;
                let timer = 50
                let inte = setInterval(() => {
                    if(ms >= timer && fl.folder != "Notas") {
                        deletefolder()
                        clearInterval(inte)
                    }
                    ms += 1;
                }, 10);
                function uped(u) {
                    clearInterval(inte)
                    if(ms < timer) {
                        if(fl != folderMenu.querySelector('.folder.active')){
                            that.SelFolder(fl.folder);
                            that.CloseMenu();
                        }
                    }
                    flpc.removeEventListener('mouseup',uped)
                }
                flpc.addEventListener('mouseup',uped)
            })

            fl.addEventListener('mousedown', e => {
                let ms = 0;
                let timer = 50
                let inte = setInterval(() => {
                    if(ms >= timer && fl.folder != "Notas") {
                        deletefolder()
                        clearInterval(inte)
                    }
                    ms += 1;
                }, 10);
                function uped(u) {
                    clearInterval(inte)
                    if(ms < timer) {
                        if(fl != folderSection.querySelector('.folder.active')){
                            that.SelFolder(fl.folder);
                            that.CloseMenu();
                        }
                    }
                    fl.removeEventListener('mouseup',uped)
                }
                fl.addEventListener('mouseup',uped)
            })
            fl.addEventListener('touchstart', e => {
                let ms = 0;
                let timer = 50
                let inte = setInterval(() => {
                    if(ms >= timer && fl.folder != "Notas") {
                        deletefolder()
                        clearInterval(inte)
                    }
                    ms += 1;
                }, 10);
                function uped(u) {
                    clearInterval(inte)
                    if(ms < timer) {
                        if(fl != folderSection.querySelector('.folder.active')){
                            that.SelFolder(fl.folder);
                            that.CloseMenu();
                        }
                    }
                    fl.removeEventListener('touchend',uped)
                }
                fl.addEventListener('touchend',uped)
            })
        })

        this.DB().get().forEach(folder => {
            if(this.actualfolder == folder) {
                this.SelFolder(folder,first)
            }
        })
        let addbtnpc = document.createElement('div');
        let addbtn = document.createElement('div');

        addbtnpc.classList.add('addftbtn')
        addbtn.classList.add('addftbtn')

        addbtnpc.innerHTML = "Nueva Carpeta";
        addbtn.innerHTML = "Nueva Carpeta";

        addbtn.addEventListener('click', CreateFolder)
        addbtnpc.addEventListener('click', CreateFolder)

        container.appendChild(addbtn);
        folderMenu.parentNode.appendChild(addbtnpc);
    }

    SelFolder(folder,firstanimation = true) {
        SelectMode.DisableMode();
        first = firstanimation;
        localStorage.setItem('LastFolder',folder);
        this.actualfolder = folder;
        let folderSection = document.querySelector('.folderSection');
        let fts = folderSection.querySelectorAll('.folder');

        let folderMenu = document.querySelector('.foldersMenu .container');
        let ftsm = folderMenu.querySelectorAll('.folder');

        ftsm.forEach(ft => {
            ft.classList.remove('active')
        })
        fts.forEach(ft => {
            ft.classList.remove('active')
        })

        ftsm.forEach(ft => {
            if(ft.folder == folder){
                ft.classList.add('active')
                let tabInit = document.querySelector('.header .tab');
                tabInit.querySelector('span').innerHTML = `${ft.folder}`;
            }
        })
        fts.forEach(ft => {
            if(ft.folder == folder){
                ft.classList.add('active')
                let tabInit = document.querySelector('.header .tab');
                tabInit.querySelector('span').innerHTML = `${ft.folder}`;
            }
        })

        this.RefreshNotas();
    }
    RefreshNotas() {
        let container = document.querySelector('.notes-preview-container')
        container.classList.remove('not');
        container.innerHTML = '';

        // document.querySelector('.superspace').style.display = "none";
        let date = new Date();
        // create notes
        let notesarray = DB.ReloadData().filter(nota => nota.folder === this.actualfolder);
        notesarray.forEach((el,id) => {
            
            let hour = "",
                day = "",
                year = "",
                minute = "",
                month = "",
                AM_OR_PM = "",
                ic = "",
                lasted = ""
    
            if(el.time.hour == date.getHours() && el.time.day == date.getDate() && el.time.month == date.getMonth() && el.time.year == date.getFullYear()){
                lasted = Math.abs(date.getMinutes() - el.time.minute);
                if(lasted == 0) {
                    lasted = "Justo Ahora"
                }else if(lasted == 1) {
                    lasted = `Hace 1 minuto`
                
                }else {
                    lasted = `Hace ${lasted} minutos`
                }
            }    
            if(el.time.hour != date.getHours() || el.time.day != date.getDate() || el.time.month != date.getMonth() || el.time.year != date.getFullYear() ){
    
                hour = el.time.hour;
                minute = (el.time.minute <= 9)? "0" + el.time.minute : el.time.minute;
                ic = ":"
                if(el.time.hour >= 13){
                    hour = hour - 12;
                }
                if(el.time.hour >= 12){
                    AM_OR_PM = "PM";
                }else {
                    AM_OR_PM = "AM";
                }
            }
            if(el.time.day != date.getDate() || el.time.month != date.getMonth() || el.time.year != date.getFullYear() ){
                day = el.time.day;
                let ayer = date.getDate() - 1;
                month = months[date.getMonth()];
                if(day == ayer && el.time.month == date.getMonth() && el.time.year == date.getFullYear()){
                    month = "";
                    day = "Ayer";
                }
            }
            if(el.time.year != date.getFullYear()){
                year = el.time.year;
            }
            let f = {
                content:  el.content.replace(/<.+?>/gim,'').substr(0,61)
            }
            // grid
            let note = document.createElement('div');
            note.setAttribute('identifier',el.identifier)
            note.classList.add("note-preview");
            if(selectmode == true){
                note.classList.add('selectmode')
            }
            if(first == true) {
                note.style.animation = "ini_note ease forwards 500ms"
            }
            note.innerHTML = `
            <div class="note">${f.content.replace(/<.+?>/gim,'')}</div>
            <div class="more">...</div>
            <div class="date">${year} ${month} ${day} ${hour}${ic}${minute} ${AM_OR_PM} ${lasted}</div>
            <div class="select"><div class="line"></div></div>
            `
            if(f.content.length != 61) {
                note.removeChild(note.querySelector('.more'));
            }
            

            container.appendChild(note);
            let height = Math.round(note.getBoundingClientRect().height / 10);
			 if(height == 9) {
                height = 10;
            }
			if(height == 7) {
                height = 8;
            }
            note.style.gridRowEnd = `span ${height}`;

            note.addEventListener('mousedown', e => {
                let ms = 0;
                let menutime = 150;
                let bezier = 'cubic-bezier(0.230, 1.000, 0.320, 1.000)'
                note.animate([
                    {transform: `scale(0.9)`},
                    {transform: `scale(0.98)`},
                    {transform: `scale(1)`}
                ],{
                    duration: 1000,
                    easing: bezier,
                    fill: "forwards",
                })
                let clicks = setInterval(() => {
                    ms += 1;
                    if (ms >= menutime){
                        clearInterval(clicks)
                        //SelectMode
                        SelectMode.Active();
                        SelectThis();
                    }
                }, 3);
                function SelectThis() {
                    let sel = note.querySelector('.select')
                    sel.classList.toggle('active');
                    let numsels = document.querySelector('.numsels');
                    numsels.innerHTML = `${SelectMode.NumSelectes()} Notas Seleccionadas`
                    sel.animate([
                        {transform: `scale(0.9)`},
                        {transform: `scale(0.98)`},
                        {transform: `scale(1)`}
                    ],{
                        duration: 1000,
                        easing: bezier,
                        fill: "forwards",
                    })
                    if(SelectMode.NumSelectes() == SelectMode.totalNotes()) {
                        document.querySelector('.selbtn').style.color = "#f88706";
                    }else {
                        document.querySelector('.selbtn').style.color = null;
                    }
                }
                function mouseup(e) {
                    clearInterval(clicks)
                    if(ms < menutime && e.type != "mouseleave") {
                        if(selectmode == false){
                            let did = DB.ReloadData().findIndex(nota => nota.identifier === el.identifier);
                            // Notes.OpenEditor(did);
                            new Editor(el.identifier)
                        }else {
                            SelectThis();
                        }
                    }
                    ms = 0;
            
                    note.removeEventListener('mouseleave',mouseup)
                    note.removeEventListener('mouseup',mouseup)
                }
                note.addEventListener('mouseleave',mouseup)
                note.addEventListener('mouseup',mouseup)
            })
            note.addEventListener('touchstart',e => {
                let ms = 0;
                let menutime = 150;
                let bezier = 'cubic-bezier(0.230, 1.000, 0.320, 1.000)'
                note.animate([
                    {transform: `scale(0.9)`},
                    {transform: `scale(0.98)`},
                    {transform: `scale(1)`}
                ],{
                    duration: 1000,
                    easing: bezier,
                    fill: "forwards",
                })
                let clicks = setInterval(() => {
                    ms += 1;
                    if (ms >= menutime){
                        clearInterval(clicks)
                        //SelectMode
                        SelectMode.Active();
                        SelectThis();
                    }
                }, 3);
                function SelectThis() {
                    let sel = note.querySelector('.select')
                    sel.classList.toggle('active');
                    let numsels = document.querySelector('.numsels');
                    numsels.innerHTML = `${SelectMode.NumSelectes()} Notas Seleccionadas`
                    sel.animate([
                        {transform: `scale(0.9)`},
                        {transform: `scale(0.98)`},
                        {transform: `scale(1)`}
                    ],{
                        duration: 1000,
                        easing: bezier,
                        fill: "forwards",
                    })
                    if(SelectMode.NumSelectes() == SelectMode.totalNotes()) {
                        document.querySelector('.selbtn').style.color = "#f88706";
                    }else {
                        document.querySelector('.selbtn').style.color = null;
                    }
                }
                function mouseup(e) {
                    clearInterval(clicks)
                    if(ms < menutime && ms >= 75) {
                        if(selectmode == false){
                            new Editor(el.identifier)
                        }else {
                            SelectThis();
                        }
                    }
                    ms = 0;
            
                    note.removeEventListener('touchend',mouseup)
                }
                note.addEventListener('touchend',mouseup)
            })
        });
        if(first == true){
            first = false;
        }
        if(notesarray.length == 0){
            container.classList.add('not');
            container.innerHTML = `
            <div class="NoNotes">
                <i class="material-icons">note_add</i>
                <span>No hay Notas</span>
                <div class="btn" onclick="newNote()">Crea una</div>
            </div>
            `
        }

        if(Search.actualsearch.trim() && notesarray.length != 0){

            Search.search(Search.actualsearch);
        }
    }

    OpenMenu(){
        if(this.isMenuOpen == false && window.matchMedia("(max-width: 500px)").matches == true) {
            this.menu.style.display = null;
            let that = this;
            document.querySelector('.header').style.borderRadius = "0px"
            this.menu.animate([
                {transform: "translateY(-100px)", opacity: "0"},
                {transform: "translateY(0px)", opacity: "1"}
            ],{
                duration: 500,
                easing: "ease",
                fill: "forwards",
            })
            function winde(e) {
                let ct = e.path[0].classList[0]
                if(ct == "folderSection"){
                    that.CloseMenu();
                    window.removeEventListener('click', winde)
                }
            }
            window.addEventListener('click', winde)
            this.isMenuOpen = true;
        }
    }

    DeleteFolder(fold) {
        if(this.actualfolder == fold){
            this.SelFolder(this.DB().get()[0]);
        }
        let respuesta = this.DB().remove(fold);
        this.Refresh();
        return respuesta;
    }

    CloseMenu() {
        if(this.isMenuOpen == true) {
            document.querySelector('.header').style.borderRadius = null;
            this.menu.animate([
                {transform: "translateY(0px)", opacity: "1"},
                {transform: "translateY(-100px)", opacity: "0"}
            ],{
                duration: 500,
                easing: "ease",
                fill: "forwards",
            })
            setTimeout(() => {
                this.menu.style.display = "none";
            }, 501);
            this.isMenuOpen = false;
        }

    }
}
function CreateFolder() {
    Swal.fire({
        confirmButtonText: 'Crear',
        input: 'text',
        inputLabel: 'Nueva Carpeta',
        inputPlaceholder: 'Nombre',
      }).then((result) => {
        if (result.isConfirmed) {
            if(result.value.trim()){
                if(Folders.DB().add(result.value)) {
                    Folders.Refresh();
                }else {
                    Swal.fire({
                        icon: 'error',
                        text: 'Esa Carpeta ya existe!',
                    })
                }
            }else {
                Swal.fire({
                    icon: 'error',
                    text: 'La Carpeta no puede tener un nombre vacio!',
                })
            }

        }
    })
}

class SearchNotesClass {
    constructor() {
        let that = this;
        this.actualsearch = "";
        
        this.search_container = document.querySelector('.searchcontainer')
        this.input = this.search_container.querySelector('input')
        let closebtn = this.search_container.querySelector('.closebtnsearch');

        closebtn.addEventListener('click', e => {
            this.input.value = "";
            that.search("");
            let val = this.input.value;
            if(val.length == 0){
                this.search_container.classList.remove('active')
            }else {
                this.search_container.classList.add('active')
            }
        })

        this.input.addEventListener('input', e => {
            let val = this.input.value;
            if(val.length == 0){
                this.search_container.classList.remove('active')
            }else {
                this.search_container.classList.add('active')
            }
            that.search(val);
        })
    }
    search(string) {
        this.actualsearch = string;
        let notes = document.querySelectorAll('.note-preview');
        let note_container = document.querySelector('.notes-preview-container');

        let noresultelm = document.createElement('div');
        noresultelm.className = "NoNotes NoResult"
        noresultelm.innerHTML = `<i class="material-icons">search_off</i>
        <span>No hay Resultados</span>`;

        if(!notes.length == 0){
            if(string.trim()){
                notes.forEach(note => {
                    note.classList.remove('none');
                })
                let total = 0;
                notes.forEach(note => {
                    let result = document.querySelector('.NoResult');
                    if(result) {
                        result.parentNode.removeChild(result)
                    }
                    let identifier = note.getAttribute('identifier')
    
                    let data = DB.ReloadData().find(data => data.identifier == identifier);
                    let regex = new RegExp(`${string}`,'gim')
    
                    if(data.content.search(regex) == -1) {
                        note.classList.add('none');
                    }else {
                        total += 1;
                    }
                })
                if(total == 0) {
                    note_container.classList.add('not');
                    let result = document.querySelector('.NoResult');
                    if(!result) {
                        note_container.appendChild(noresultelm);
                    }
                }else {
                    note_container.classList.remove('not');
                }
            }else {
                let result = document.querySelector('.NoResult');
                if(result) {
                    result.parentNode.removeChild(result)
                }
                note_container.classList.remove('not')
                notes.forEach(note => {
                    note.classList.remove('none');
                })
                
            }
        }

    }
}

let Search = new SearchNotesClass();
let Folders = new FoldersClass();
/*
  dev
  ==========================================================>
*/
function strikfire (n) {
    for (let i = 0; i <= n; i++) {
        let date = new Date();
        if(i % 3){
            DB.add(`note ${i}`,date.getDate(),date.getMonth(),date.getFullYear(),date.getHours(),date.getMinutes(),"indefinido ...",Folders.actualfolder)
        } else {
            DB.add(`note ${i} Lorem ipsum dolor sit,facere ratione quam numquam?`,date.getDate(),date.getMonth(),date.getFullYear(),date.getHours(),date.getMinutes(),"indefinido ...",Folders.actualfolder)
        }
    }
}