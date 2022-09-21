const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sept","Oct","Nov","Dic"];

function timeAgo(time = 0) {
    let turnday = new Date(time);
    let aago = new Date(turnday.getFullYear(),turnday.getMonth(),turnday.getDate(),turnday.getHours(),turnday.getMinutes(),turnday.getSeconds());
    let realtime = aago.getTime();
    let ltime = Date.now();
    let final = Math.round((ltime - realtime) / 1000);
    // just now
    if(final <= 60){
        return "justo Ahora"
        // minutes
    }else if(final >= 60) {
        final = Math.round(final / 60);
            // hours
            if(final >= 60) {
                final = Math.round(final / 60);
                    //days
                    if(final >= 24){
                        final = Math.round(final / 24);
                            //Months And Years
                            if(final >= 30) {
                                final = Math.round(final / 30);

                                return `${(final >= 365)? aago.getFullYear()+" ":""}${months[aago.getMonth()]} ${aago.getDate()+1} ${aago.getHours() - ((aago.getHours() >= 12)? 12 : 0)}:${(aago.getMinutes() <= 9)? "0":""}${aago.getMinutes()}${(aago.getHours() >= 12)? "PM" : "AM"}`
                            }
                        return `hace ${final} ${(final == 1)? "día": "dias"}`
                    }

                return `hace ${final} ${(final == 1)? "hora": "horas"}`
            }
        return `hace ${final} ${(final == 1)? "minuto": "minutos"}`;
    }
}