import { sfx } from "../config";


export type Elmnt = HTMLElement | null;


/**
 * Date difference into text
 * @param date1 Most recent date
 * @param date2 Oldest date
 */
export function calcDateDiffToTxt(date1 = new Date, date2 = new Date) {
    let diffMs = date1.getTime() - date2.getTime();
    let diffSeconds = diffMs / 1000;
    let diffMinutes = diffSeconds / 60;
    let diffHours = diffMinutes / 60;
    let diffDays = diffHours / 24;
    let diffWeeks = diffDays / 7;
    let diffMonths = diffWeeks / 4;
    let diffYears = diffMonths / 12;

    switch (true) {
        case diffYears >= 1:
        return `${diffYears.toFixed(0)} year${diffYears.toFixed(0) == '1' ? "" : "s"}`;
        
        case diffMonths >= 1:
        return `${diffMonths.toFixed(0)} month${diffMonths.toFixed(0) == '1' ? "" : "s"}`;
        
        case diffWeeks >= 1:
        return `${diffWeeks.toFixed(0)} week${diffWeeks.toFixed(0) == '1' ? "" : "s"}`;

        case diffDays >= 1:
        return `${diffDays.toFixed(0)} day${diffDays.toFixed(0) == '1' ? "" : "s"}`;

        case diffHours >= 1:
        return `${diffHours.toFixed(0)} hour${diffHours.toFixed(0) == '1' ? "" : "s"}`;

        case diffMinutes >= 1:
        return `${diffMinutes.toFixed(0)} minute${diffMinutes.toFixed(0) == '1' ? "" : "s"}`;

        default:
        return `${diffSeconds.toFixed(0)} second${diffSeconds.toFixed(0) == '1' ? "" : "s"}`;
    }
}


export const selectedAttr = 'selected';
export const pageAttr = 'data-page';

export function currentPage() {
    return document.querySelector(`.page[${selectedAttr}]`);
}

export let startPageTimeout: NodeJS.Timeout;
export let endPageTimeout: NodeJS.Timeout;
/**
 * Switch the currently displayed page to the one given within this function
 * @param pageName The `data-page` for the specific page & button to show/highlight
 */
export function changePage(pageName: string, ms = 300) {
    // stop current timeout
    clearTimeout(startPageTimeout);
    clearTimeout(endPageTimeout);
    
    // defs
    const currentPage = document.querySelector(`.page[${selectedAttr}]`) as Elmnt;
    const currentBtn = document.querySelector(`#nav .btn[${pageAttr}][${selectedAttr}]`) as Elmnt;
    const targetPage = document.querySelector(`.page[${pageAttr}="${pageName}"]`) as Elmnt;
    const targetBtn = document.querySelector(`#nav .btn[${pageAttr}="${pageName}"]`) as Elmnt;


    // current page & btn
    if (currentPage) {
        currentPage.removeAttribute(selectedAttr);
        toggleTabIndexs(currentPage);
    }
    if (currentBtn) currentBtn.removeAttribute(selectedAttr);
    if (!targetBtn) throw new Error(`no buttn was found with the "${pageAttr}" attr. value of "${pageName}"`);
    targetBtn.setAttribute(selectedAttr, '');

    startPageTimeout = setTimeout(() => {
        // find target page & btn
        if (!targetPage) throw new Error(`no page was found with the "${pageAttr}" attr. value of "${pageName}"`);
        if (!targetBtn) throw new Error(`no buttn was found with the "${pageAttr}" attr. value of "${pageName}"`);

        // show page
        endPageTimeout = setTimeout(() => {
            targetPage.setAttribute(selectedAttr, '');
            toggleTabIndexs(targetPage);
        }, ms);
    }, ms);
}


export function toggleSide(force?: boolean) {
    const pplBtn = document.querySelector('#nav .btn[btn-action="ppl"]') as Elmnt;
    const side = document.querySelector('#side') as Elmnt;
    if (
        pplBtn
        && side
    ) {
        pplBtn.toggleAttribute('selected', force);
        side.toggleAttribute('active', force);
        toggleTabIndexs(side);
        sfx.sidemenu.play();
    } else {
        console.error('possible missing divs:', { pplBtn, side });
        throw new Error(`either "pplBtn" or "side" was not found. check the log above`);
    }
}


/**
 * @param parent parent div
 * @param force `true` to allow for tabbing, `false` for WHAT DO YOU THINK DUMBASS. if left `undefined`, will automaticly change tabindex
 */
export function toggleTabIndexs(parent: Elmnt, force?: boolean) {
    const indexAttr = 'tabindex';

    if (parent) {
        const indexDivs = parent.querySelectorAll(`[${indexAttr}]`);
        indexDivs.forEach((indexDiv) => {
            const index = indexDiv.getAttribute(indexAttr);
            if (
                force === true
                || (
                    force === undefined
                    && index === '-1'
                )
            ) indexDiv.setAttribute(indexAttr, '0');
            else indexDiv.setAttribute(indexAttr, '-1');
            return indexDiv.getAttribute(indexAttr);
        });
    } else throw new Error(`toggleTabIndexs: the parent does not exist`);
}


export const scrollOffset = 20;
