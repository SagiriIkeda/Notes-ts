import React, { createRef } from "react";
import Screen from "../../util/Screen";
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
    dragtime = 0;

    container = createRef<HTMLDivElement>();

    startY = 0;

    constructor(props: AuxMenuProps) {
        super(props)
        this.UI = props.UI;
        this.UI.AUX = this;

        this.setOptions = this.setOptions.bind(this);
        this.close = this.close.bind(this);
        this.set = this.set.bind(this);
        this.comprobateOutsideClick = this.comprobateOutsideClick.bind(this);

        window.removeEventListener('mouseup', this.comprobateOutsideClick);
        this.StartDragableContainer = this.StartDragableContainer.bind(this);
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
        this.container.current?.removeEventListener("touchstart", this.StartDragableContainer);

        clearTimeout(this.dragtime);
        window.removeEventListener('mouseup', this.comprobateOutsideClick);
        this.setState({
            opend: false,
            top: 0,
            left: 0
        })
    }

    set(options: AuxList, event: React.MouseEvent, type: string) {
        clearTimeout(this.time);
        clearTimeout(this.dragtime);
        event.preventDefault();
        if (Screen.isMobile()) {
            const container = this.container.current as HTMLDivElement;

            this.dragtime = setTimeout(() => {
                container.addEventListener("touchstart", this.StartDragableContainer)
            }, 250);

            return this.setOptions(options);
        }

        window.removeEventListener('mouseup', this.comprobateOutsideClick);
        window.removeEventListener('mousedown', this.comprobateOutsideClick);
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
        window.addEventListener('mousedown', this.comprobateOutsideClick);
    }

    comprobateOutsideClick(event: MouseEvent) {
        this.time = setTimeout(() => {
            const target = event.target as HTMLDivElement;

            if (!target.classList.contains("aux-option")) {
                event.buttons == 1 && this.close();
                return true;
            }

            return false;
        }, 1)
    }


    StartDragableContainer(e: TouchEvent) {
        const container = this.container.current as HTMLDivElement;
        const firstTouch = e.targetTouches[0]

        if (this.startY == 0) this.startY = firstTouch.clientY;

        const self = this;
        const { startY } = this;

        document.addEventListener("touchmove", StartDrag);
        document.addEventListener("touchend", EndDrag);

        function StartDrag(e: TouchEvent) {
            const touch = e.touches[0];

            const { clientY } = touch;

            const translateY = clientY - startY;

            if (translateY > 0) {
                container.style.translate = `0px ${translateY}px`;
            }
        }



        function EndDrag(e: TouchEvent) {
            self.startY = 0;
            // console.log(e);

            const touch = e.changedTouches[0];

            const { clientY } = touch;
            //moved
            const translateY = (clientY - startY) / container.getBoundingClientRect().height * 100;

            // console.log(translateY);
            if (translateY > 50) {
                self.close();

                // container.style.translate = "";
            } 
            container.animate({ translate: "0px 0px" }, {
                easing: "ease",
                duration: 100,
            })
            .addEventListener("finish", () => {
                container.style.translate = "";
            })
            // else {
            // }


            // console.log("terminó");


            document.removeEventListener("touchmove", StartDrag);
            document.removeEventListener("touchend", EndDrag);
        }
    }




    render() {
        const { state } = this;
        const { type } = state;


        return (
            <div className="aux-fixer-container" data-open={state.opend}>
                <div className="AuxContainer" ref={this.container} style={{ left: state.left, top: state.top }}>
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
                <div className="__aux-shadow" onClick={this.close} ></div>
            </div>
        )

        // if (state.opend) {
        //     return (

        //         <>
        //             <div className="AuxContainer" style={{ left: state.left, top: state.top }}>

        //                 {(state.options.length != 0) ? (
        //                     <div className="TextAction">Accion...</div>
        //                 ) : (
        //                     <div className="TextAction Noaction">No hay Acciones</div>
        //                 )}
        //                 {
        //                     state.options.map((option, index) => (
        //                         <AuxBtn data={option} AUX={this} key={`${type}-${index}`} />
        //                     ))
        //                 }
        //             </div>
        //             <div className="__aux-shadow __opend"></div>
        //         </>
        //     )
        // }

        // return (<div className="__aux-shadow"></div>)

    }
}