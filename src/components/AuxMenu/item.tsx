export default interface AuxItem {
    icon: string,
    name: string,
    action?: () => boolean | void,
    danger?: boolean,
    actived?: boolean,
    disabled?: boolean,
    hr?: boolean,
    desc?: string,
}

export type AuxList = AuxItem[];