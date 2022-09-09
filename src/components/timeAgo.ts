export const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sept", "Oct", "Nov", "Dic"];

export default function timeAgo(time = 0) {
    let DateTime = new Date(time);
    let RoundedAgo = new Date(DateTime.getFullYear(), DateTime.getMonth(), DateTime.getDate(), DateTime.getHours(), DateTime.getMinutes(), DateTime.getSeconds());
    let realtime = RoundedAgo.getTime();
    let NowTime = Date.now();
    let DiferenceTime = Math.round((NowTime - realtime) / 1000);
    // just now
    if (DiferenceTime <= 60) {
        return "justo Ahora"
        // minutes
    } else if (DiferenceTime >= 60) {
        DiferenceTime = Math.round(DiferenceTime / 60);
        // hours
        if (DiferenceTime >= 60) {
            DiferenceTime = Math.round(DiferenceTime / 60);
            //days
            if (DiferenceTime >= 24) {
                DiferenceTime = Math.round(DiferenceTime / 24);
                //Months And Years
                if (DiferenceTime >= 30) {
                    DiferenceTime = Math.round(DiferenceTime / 30);

                    return `${(DiferenceTime >= 365) ? RoundedAgo.getFullYear() + " " : ""}${months[RoundedAgo.getMonth()]} ${RoundedAgo.getDate() + 1} ${RoundedAgo.getHours() - ((RoundedAgo.getHours() >= 12) ? 12 : 0)}:${(RoundedAgo.getMinutes() <= 9) ? "0" : ""}${RoundedAgo.getMinutes()}${(RoundedAgo.getHours() >= 12) ? "PM" : "AM"}`
                }
                return `hace ${DiferenceTime} ${(DiferenceTime == 1) ? "día" : "dias"}`
            }

            return `hace ${DiferenceTime} ${(DiferenceTime == 1) ? "hora" : "horas"}`
        }
        return `hace ${DiferenceTime} ${(DiferenceTime == 1) ? "minuto" : "minutos"}`;
    }
}