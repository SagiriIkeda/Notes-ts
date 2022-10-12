export const enum Sizes {
    MobileS = 350,
    Mobile = 650,
}


const { documentElement } = document;


export default class Screen {
    /** cached isMobile() */
    static _isMobile = Screen.isMobile();

    static getHeight() {
        return document.documentElement.offsetHeight;
    }

    static isMobile() {
        return documentElement.offsetWidth <= Sizes.Mobile;
    }
    static isMobileS() {
        return documentElement.offsetWidth <= Sizes.MobileS;
    }

}
