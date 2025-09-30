/**
 * Reveals the description
 * @param {MouseEvent} e
 */
export function showDescription(e) {
    if (e.target === e.currentTarget) {
        e.target.children[0].classList.remove("hidden");
    }
}

/**
 * Hides the description
 * @param {MouseEvent} e
 */
export function hideDescription(e) {
    if (e.target === e.currentTarget) {
        e.target.children[0].classList.add("hidden");
    }
}