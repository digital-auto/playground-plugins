type PopupDeactivateFunction = () => void

export interface BoxType {
    window: Window | null
    injectNode: (node: Node) => void
    injectHTML: (html: string) => void
    triggerPopup: (node: Node, className?: string) => undefined | PopupDeactivateFunction
}