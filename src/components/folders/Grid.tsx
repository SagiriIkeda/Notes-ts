import React, { Children, createRef, ReactNode, RefObject } from "react";

interface GridProps {
    children: ReactNode,
    afterUpdate?: (container: RefObject<HTMLDivElement> ) => void;
}

interface VerticalPosition {
    y: number,
}

export enum GridConfig {
    IGNORED_CLASSNAME = "__gridIgnore",
    ANIMATION_DURATION = 250,
}

interface GridElement extends HTMLDivElement {
    vgridFirstAnimation?: boolean;
}

export default class VerticalGrid extends React.Component<GridProps> {
    private container = createRef<HTMLDivElement>();

    constructor(props: GridProps) {
        super(props);

        this.UpdateElementPositions = this.UpdateElementPositions.bind(this);
    }

    UpdateElementPositions() {
        const { afterUpdate } = this.props;
        const container = this.container.current;
        if (container) {
            const childrens = container.childNodes as NodeListOf<GridElement>;
            const positions: VerticalPosition[] = [];

            childrens.forEach((child, indx) => {
                if (!child.classList.contains(GridConfig.IGNORED_CLASSNAME)) {
                    const { height } = child.getBoundingClientRect();
                    const lastPosition = positions.at(-1);
                    const positionY = lastPosition?.y ?? 0;

                    positions.push({
                        y: positionY + height,
                    })

                    if (child.vgridFirstAnimation != true) {
                        child.style.top = `${positionY}px`;
                        child.vgridFirstAnimation = true;
                    } else {
                        child.animate({ top: `${positionY}px` }, {
                            easing: "ease",
                            fill: "forwards",
                            duration: GridConfig.ANIMATION_DURATION
                        })
                    }

                }
            })
            const lastPosition = positions.at(-1);
            if (lastPosition) {
                const container = this.container.current;
                if (container) container.style.height = `${lastPosition.y}px`;
            }
            afterUpdate && afterUpdate(this.container)
        }
    }

    componentDidUpdate() {
        this.UpdateElementPositions();
    }

    componentDidMount() {
        this.UpdateElementPositions();
    }


    render() {
        const { props } = this;

        return (
            <div className="VerticalGrid" ref={this.container} >
                {props.children}
            </div>
        );
    }
}