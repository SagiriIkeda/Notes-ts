import React, { ReactNode } from "react";
import "./css/Tooltips.css"

type Aling = "center" | "right" | "left";
type Positions = "top" | "bottom" | "left" | "right";
export type Theme = "dark" | "light";


interface TooltipsConfig {
    margin: number, //Number: margen en pixeles entre el tooltip y el elemento
    delay: number, //Number: tiempo en milisegundos que tardara en empezar la animacion del tooltip
    aling: Aling, //String: alineacion que tendra el contenido del tooltip
    maxWidth: string,  //String: width maximo que tendra el tooltip
    minWidth: string, //String: width minimo que tendra el tooltip
    width: string, //String: width que tendra el tooltip, al usar este minWidth y maxWidth son anulados
    diference: number, //Number: margen en pixles que tendra el tooltip al sobrepasar la pantalla
    position: Positions,
    className: string[],
    description: string,
    text: string,
    theme: Theme,
    render?: JSX.Element,
}

interface TooltipsProps extends Partial<TooltipsConfig> {
    children: ReactNode,
    config?: Partial<TooltipsConfig>
}

/**
 *  Tooltips TS
 *  LICENCE MIT SagiriIkeda
 *  VERSION 4.5 React
 */
export default class Tooltip extends React.Component<TooltipsProps> {
    tooltip = React.createRef<HTMLDivElement>();
    triangle = React.createRef<HTMLDivElement>();
    father = React.createRef<HTMLDivElement>();
    
    config: TooltipsConfig;
    timeout?: number;

    constructor(props: TooltipsProps) {
        super(props);

        this.config = this.loadConfig();
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.SetPosition = this.SetPosition.bind(this);

    }
    loadConfig() {
        const { props } = this;
  
        this.config = { ...TooltipsDefault, ...props.config, ...props };

        this.config.className = ["tooltip",...this.config.className];
       
        if(this.config.theme == "light"){
            this.config.className.push("ligth");
        }

        return this.config;
    }

    open() {
        const { config } = this;

        const tooltip = this.tooltip.current;
        const { delay, position } = config;

        clearTimeout(this.timeout);
        
        this.timeout = setTimeout(() => {
            this.SetPosition(position);
            if (position == "top") {
                tooltip?.animate({ opacity: 1, transform: "translateY(-2px)" }, {
                    duration: 100, fill: "forwards", easing: "ease"
                })
            } else if (position == "bottom") {
                tooltip?.animate({ opacity: 1, transform: "translateY(2px)" }, {
                    duration: 100, fill: "forwards", easing: "ease"
                })
            } else if (position == "left") {
                tooltip?.animate({ opacity: 1, transform: "translateX(2px)" }, {
                    duration: 100, fill: "forwards", easing: "ease"
                })
            } else if (position == "right") {
                tooltip?.animate({ opacity: 1, transform: "translateX(-2px)" }, {
                    duration: 100, fill: "forwards", easing: "ease"
                })
            }
        }, delay);
    }

    SetPosition(position: Positions) {

        const { config } = this;
        const { margin } = this.config;

        let tooltip = this.tooltip.current as HTMLDivElement;
        let triangle = this.triangle.current as HTMLDivElement;
        let father = this.father.current as HTMLDivElement;

        let isFixed = window.getComputedStyle(father).getPropertyValue('position') == "fixed" ? true : false;

        if (isFixed && tooltip) {
            tooltip.style.position = "fixed";
        }
        function getPostion(element: HTMLDivElement) {
            if (!element) return { top: 0, left: 0 };
            let y = 0;
            let x = 0;
            x += element.offsetLeft;
            y += element.offsetTop;
            return { top: y, left: x };
        }
        //positions
        let finalposition = { left: 0, top: 0 }
        let calculatedPositions: { right: number | true, left: number | true, bottom: number | true, top: number | true } = { right: 0, left: 0, bottom: 0, top: 0 };
        setAngle(position);

        function setAngle(pos: Positions) {
            position = pos;
            let postionfath = getPostion(father);
            let fatherRect = father.getBoundingClientRect();
            let tooltipRect = tooltip.getBoundingClientRect();
            let marginn = 5 + margin;
            //SET TRIANGLE POSITION IF DESBORDING FOR SCREEN
            function DetectDesbordRightAndLeft() {
                //SET TRIANGLE POSITION TO CENTER FOR FATHER ELEMENT
                triangle.style.left = "";
                triangle.style.top = "";
                function seTriangle() {
                    let center = (postionfath.left - finalposition.left) + (fatherRect.width / 2) - 5;
                    triangle.style.left = `${center}px`;
                }
                //DESBORD X AND
                if (finalposition.left + tooltipRect.width >= window.scrollX + window.innerWidth) {
                    let diference = (finalposition.left + tooltipRect.width) - (window.scrollX + window.innerWidth);
                    finalposition.left -= (diference + config.diference);
                    seTriangle();
                }
                if (window.scrollX - (finalposition.left) > 0) {
                    finalposition.left += window.scrollX - (finalposition.left) + config.diference;
                    seTriangle();
                }
            }
            function DetectDesbordTopAndBottom() {
                //SET TRIANGLE POSITION TO CENTER FOR FATHER ELEMENT
                triangle.style.left = "";
                triangle.style.top = "";
                function seTriangle() {
                    let center = (postionfath.top - finalposition.top) + (fatherRect.height / 2) - 5;
                    triangle.style.top = `${center}px`;
                }

                if (finalposition.top + tooltipRect.height >= window.scrollY + window.innerHeight) {
                    let diference = (finalposition.top + tooltipRect.height) - (window.scrollY + window.innerHeight);
                    finalposition.top -= (diference + config.diference);
                    seTriangle();
                }
                if (window.scrollY - (finalposition.top) > 0) {
                    finalposition.top += window.scrollY - (finalposition.top) + config.diference;
                    seTriangle();
                }
            }
            //SET POSITION
            if (pos == "top") {
                if (calculatedPositions.top == true && calculatedPositions.bottom == true) {
                    console.warn("TooltipsJS Error: The tooltip cannot be displayed, please adjust the size of its element and assign it another position", father);
                    return false;
                }
                finalposition.top = postionfath.top - tooltipRect.height - marginn;
                finalposition.left = (postionfath.left - (tooltipRect.width / 2)) + (fatherRect.width / 2);
                DetectDesbordRightAndLeft();
                tooltip.setAttribute('position', 'top');
                if (window.scrollY - (finalposition.top) > 0) {
                    calculatedPositions.top = true;
                    setAngle('bottom');
                }
            } else if (pos == "bottom") {
                if (calculatedPositions.top == true && calculatedPositions.bottom == true) {
                    console.warn("TooltipsJS Error: The tooltip cannot be displayed, please adjust the size of its element and assign it another position", father);
                    return false;
                }
                finalposition.top = postionfath.top + fatherRect.height + marginn;
                finalposition.left = (postionfath.left - (tooltipRect.width / 2)) + (fatherRect.width / 2);
                DetectDesbordRightAndLeft();
                tooltip.setAttribute('position', 'bottom');
                if (finalposition.top + tooltipRect.height >= window.scrollY + window.innerHeight) {
                    calculatedPositions.bottom = true;
                    setAngle('top');
                }
            } else if (pos == "left") {
                if (calculatedPositions.left == true && calculatedPositions.right == true) {
                    setAngle('top');
                } else {
                    finalposition.top = (postionfath.top - (tooltipRect.height / 2)) + (fatherRect.height / 2);
                    finalposition.left = (postionfath.left + fatherRect.width) + marginn;
                    DetectDesbordTopAndBottom();
                    tooltip.setAttribute('position', 'left');
                    if (finalposition.left + tooltipRect.width >= window.innerWidth) {
                        calculatedPositions.left = true;
                        setAngle("right");
                    }
                }
            } else if (pos == "right") {
                if (calculatedPositions.left == true && calculatedPositions.right == true) {
                    setAngle('top');
                } else {
                    finalposition.top = (postionfath.top - (tooltipRect.height / 2)) + (fatherRect.height / 2);
                    finalposition.left = (postionfath.left - tooltipRect.width) - marginn;
                    DetectDesbordTopAndBottom();
                    tooltip.setAttribute('position', 'right');
                    if (window.scrollX - (finalposition.left) > 0) {
                        calculatedPositions.right = true;
                        setAngle("left")
                    }
                }
            }
        }

        //set pos
        tooltip.style.top = `${finalposition.top}px`;
        tooltip.style.left = `${finalposition.left}px`;
    };

    close() {
        const { config, timeout } = this;

        const tooltip = this.tooltip.current;
        const { delay, position } = config;

        clearTimeout(timeout);

        if (position == "bottom" || position == "top") {
            tooltip?.animate({ opacity: 0, transform: "translateY(0px)" }, { duration: 100, fill: "forwards", easing: "ease" })
        } else {
            tooltip?.animate({ opacity: 0, transform: "translateX(0px)" }, { duration: 100, fill: "forwards", easing: "ease" })
        }
    }

    render() {
        this.loadConfig();
        const { props, config } = this;
        const children: JSX.Element = ({...(Array.isArray(props?.children))? props.children[0] : props.children});
        const recreateChildren = React.createElement(
            children.type,
            {
                ...children.props,
                ref: this.father,
                onMouseOver: this.open,
                onMouseLeave: this.close,
            },
            children.props.children
        )

        const styles: { width?: string, minWidth?: string, maxWidth?: string,} = {};

        const { width, minWidth, maxWidth, aling } = config;

        if (width.trim()) {
            styles.width = width;
        } else {
            if (maxWidth.trim()) styles.maxWidth = maxWidth;
            if (minWidth.trim()) styles.minWidth = minWidth;
        }
        const tprop: {aling?: string} = {};
        if (aling.trim()) {
            tprop.aling = aling;
        }

        let text = config.text;

        return (
            <>
                {recreateChildren}

                <div className={config.className.join(" ")} ref={this.tooltip} style={styles}>
                    <span {...tprop}>{text}</span>
                    {config.description.trim() && <div className="description">{config.description}</div>}
                    {config.render}
                    <div className="triangle" ref={this.triangle} ></div>
                </div>
            </>
        );
    }
}



const TooltipsDefault: TooltipsConfig = {
    margin: 5, //Number: margen en pixeles entre el tooltip y el elemento
    delay: 100, //Number: tiempo en milisegundos que tardara en empezar la animacion del tooltip
    aling: "center", //String: alineacion que tendra el contenido del tooltip
    maxWidth: "",  //String: width maximo que tendra el tooltip
    minWidth: "", //String: width minimo que tendra el tooltip
    width: "", //String: width que tendra el tooltip, al usar este minWidth y maxWidth son anulados
    diference: 5, //Number: margen en pixles que tendra el tooltip al sobrepasar la pantalla
    position: "top",
    className: [],
    theme: "dark",
    description: "",
    text: "",
    render: undefined,
}