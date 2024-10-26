/**
 * Returns a function that will call
 * the reverse action automatically with the last argument called
 * with it before calling the action with the current argument.
 *
 * Suitable for things like tabs and selections...
 *
 * @example
 * import { rev } from 'deleight/function'
 * const hide = (dialog: HTMLDialogElement) => dialog.style.display = 'none';
 * const show = rev(
 *     (dialog: HTMLDialogElement) => dialog.style.display = null,
 *     hide
 * );
 * show(document.querySelector('#dialog1'));
 * show(document.querySelector('#dialog2'));  // dialog 1 is hidden automatically
 * show(document.querySelector('#dialog3'));  // dialog 2 is hidden automatically
 *
 * @param action
 * @param reverseAction
 */
export function reversible(action, reverseAction) {
    let lastArg;
    return function (arg) {
        if (lastArg)
            reverseAction.call(this, lastArg);
        const result = action.call(this, arg);
        lastArg = arg;
        return result;
    };
}
/**
 * Alias for {@link reversible}
 */
export const rev = reversible;
