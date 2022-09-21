let months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sept","Oct","Nov","Dic"]
class DB {

    static ReloadData(){
        if(localStorage.getItem('Notes')){
            return JSON.parse(localStorage.getItem('Notes'));
        }else {
            return [];
        }
    }
    static add(content = "text",
                day,
                month,
                year,
                hour,
                minute,
                name = "...",
                folder = "Notas",
                identifier = `${new Date().getTime()}-${DB.ReloadData().length}`) {
        let ALL_DB = this.ReloadData();
        let note = {
            name : name,
            content: content,
            time: {
                day: day,
                month:month,
                year: year,
                hour: hour,
                minute: minute,
            },
            identifier: identifier,
            folder: folder
        }
        ALL_DB.unshift(note)
        localStorage.setItem('Notes',JSON.stringify(ALL_DB));
    }
    static remove(id) {
        let DB = this.ReloadData();
        DB.splice(id,1);
        localStorage.setItem('Notes',JSON.stringify(DB));

    }
    static SecureRemove(identifier) {
        let DB = this.ReloadData();

        function FindNota(nota) {
            return nota.identifier === identifier;
        }
        this.remove(DB.findIndex(FindNota));
    }
    static DeleteDB(e){
        localStorage.removeItem('Notes')
    }
}
