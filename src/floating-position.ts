export interface FloatingButtonPosition {
    top: number;
    left: number;
}

/** Keep the floating button inside the active window's viewport. */
export function clampFloatingButtonPosition(
    top: number,
    left: number,
    buttonWidth: number,
    buttonHeight: number,
    viewportWidth: number,
    viewportHeight: number,
): FloatingButtonPosition {
    const margin = 4;
    const maxLeft = Math.max(margin, viewportWidth - buttonWidth - margin);
    const maxTop = Math.max(margin, viewportHeight - buttonHeight - margin);

    return {
        top: Math.min(Math.max(margin, top), maxTop),
        left: Math.min(Math.max(margin, left), maxLeft),
    };
}
