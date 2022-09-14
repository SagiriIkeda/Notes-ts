import { Mat } from "../prefabs";
import AuxItem from "./item";
import AuxMenu from "./Menu";

export default function AuxBtn({ data, AUX }: { data: AuxItem, AUX: AuxMenu }) {
    let className = "aux-option";

    if(data.danger) className += " danger";
    if(data.actived) className += " actived";
    if(data.disabled) className += " disabled";

    function onClick() {
        data.action && data.action()

        AUX.close();
    }

    return (
        <>
            <div
                className={className}
                onClick={onClick}
            >
                <Mat>{data.icon}</Mat> <span>{data.name}</span>
                {(data.desc) && <div  className="min">{data.desc}</div>}
            </div>
            {(data.hr === true) && <hr />}
        </>
    )
}