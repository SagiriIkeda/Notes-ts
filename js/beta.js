function DebugGenrateNotes (n) {
    for (let i = 0; i <= n; i++) {
        let content = "";
        if(i % 3){
            content = `note ${i}`;
        } else {
            content = `note ${i} Lorem ipsum dolor sit,facere ratione quam numquam?`
        }
        let data = DefaultNoteGenerate();
        data.content = content;
        DB.Notes.Add(data);
    }
}

function GETSIZE() {
    let content = "";
    function loadDatabase(name) {
        if(localStorage.getItem(name) != undefined){
            content += localStorage.getItem(name);
        }
    }
    loadDatabase("ActiveFolder");
    loadDatabase("Folders");
    loadDatabase("Notes");
    loadDatabase("AutoUp");
    let l = content.length;
    if(l > 1024){
        l = Math.round(l / 1024);
        if(l > 1024){
            l = Math.round(l / 1024);
            return l + "MB"
        }
        return l + "KB"
    }
}