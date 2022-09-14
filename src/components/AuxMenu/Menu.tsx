import React from "react";
import UINOTES from "../UI";
import AuxBtn from "./Btn";
import { AuxList } from "./item";

interface AuxMenuProps {
    UI: UINOTES
}

export default class AuxMenu extends React.Component<AuxMenuProps> {

    state = {
        options: [] as AuxList,
        opend: false,
        type: "",

        top: 0,
        left: 0
    }
    UI: UINOTES;

    time = 0;

    constructor(props: AuxMenuProps) {
        super(props)
        this.UI = props.UI;
        this.UI.AUX = this;

        this.setOptions = this.setOptions.bind(this);
        this.close = this.close.bind(this);
        this.set = this.set.bind(this);
        this.comprobateOutsideClick = this.comprobateOutsideClick.bind(this);

        window.removeEventListener('mouseup', this.comprobateOutsideClick);
    }

    setOptions(options: AuxList | false) {
        if (options == false) {
            this.setState({ options: [], opend: false })
        } else {
            this.setState({
                options,
                opend: true
            })
        }
    }

    close() {
        window.removeEventListener('mouseup', this.comprobateOutsideClick);
        this.setState({
            options: [],
            opend: false,
            type: "",
            top: 0,
            left: 0
        })
    }

    set(options: AuxList, event: React.MouseEvent, type: string) {
        clearTimeout(this.time);
        event.preventDefault();

        window.removeEventListener('mouseup', this.comprobateOutsideClick);
        let { x, y } = { x: event.clientX, y: event.clientY };
        let width = 210;
        let height = (options.length * 39 - 5) + 27 + 20;

        const rect = document.body.getBoundingClientRect()
        let maxw = rect.width;
        let maxh = rect.height;
        if ((x + width) - maxw >= 0) {
            x = x - width;
        }
        if ((y + height) - maxh >= 0) {
            y = y - height;
        }

        this.state.left = x;
        this.state.top = y;
        this.state.type = type;
        this.setOptions(options);
        window.addEventListener('mouseup', this.comprobateOutsideClick);
    }

    comprobateOutsideClick(event: MouseEvent) {
        this.time = setTimeout(() => {
            const target = event.target as HTMLDivElement;

            if (!target.classList.contains("aux-option")) {
                this.close();
                return true;
            }

            return false;
        }, 1)
    }

    render() {
        const { state } = this;
        let type = state.type;

        if (state.opend) {
            return (
                <div className="AuxContainer" style={{ left: state.left, top: state.top }}>

                    {(state.options.length != 0) ? (
                        <div className="TextAction">Accion...</div>
                    ) : (
                        <div className="TextAction Noaction">No hay Acciones</div>
                    )}
                    {
                        state.options.map((option, index) => (
                            <AuxBtn data={option} AUX={this} key={`${type}-${index}`} />
                        ))
                    }
                </div>
            )
        }

    }
}