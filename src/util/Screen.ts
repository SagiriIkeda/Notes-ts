export const enum Sizes {
    MobileS = 350,
    Mobile = 650,
}


const { documentElement } = document;


export default class Screen {

    static isMobile() {
        return documentElement.offsetWidth <= Sizes.Mobile;
    }
    static isMobileS() {
        return documentElement.offsetWidth <= Sizes.MobileS;
    }

}