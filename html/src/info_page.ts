import { scrollOffset } from "./_shared";

type InfoItemData = {
    text: string;
    img?: string;
    href?: string;
};


export class InfoItem {
    private div: HTMLDivElement;


    /**
     * make a info item for a `.info_page-list` div
     */
    constructor(data: InfoItemData) {
        this.div = document.createElement('div');
        this.div.classList.add('info_page-item');
        this.div.tabIndex = -1;
        this.div.innerHTML = `
<div class="info_page-item-img img">
    <img src="${data.img ? data.img : ''}">
</div>
<div class="info_page-item-details-container">
    <div class="info_page-item-details">
        <div class="detail-part">${data.text}</div>
        <div class="detail-part detail-part-2">${data.text}</div>
    </div>
</div>
        `;
        if (data.href) this.div.setAttribute('href', data.href);
    }

    /**
     * insert this info item into the given content div
     * @returns `null` if failed
     */
    insert(contentDiv: Element) {
        if (contentDiv.classList.contains('info_page-content')) {
            // add item to list
            const listDiv = contentDiv.querySelector('.info_page-list');
            if (!listDiv) throw new Error(`the info_page's setup is not in line with what i know`);
            let result = listDiv.insertAdjacentElement('beforeend', this.div) as HTMLDivElement | null;
            const href = this.div.getAttribute('href');
            if (href) {
                this.div.addEventListener('click', (e) => {
                    if (e.button === 0) location.href = href;
                    // maybe in the future build a site video viewer?
                    // unsure how to keep with the nfs most wanted ui since there wasn't
                    // one in the og game.
                });
                // open link in new tab
                this.div.addEventListener('auxclick', (e) => {
                    if (e.button === 1) {
                        e.preventDefault();
                        window.open(href, '_blank', 'noopener,noreferrer');
                    }
                });
            }

            // make scroll
            const detailContainter = this.div.querySelector('.info_page-item-details');
            const titleWidth = this.div.querySelector('.detail-part')?.getBoundingClientRect().width;
            if (
                detailContainter !== null
                && titleWidth !== undefined
            ) {
                if (titleWidth > detailContainter.getBoundingClientRect().width) {
                this.div.setAttribute('scroll', '');
                this.div.style.setProperty('--scroll-ms', `${titleWidth * scrollOffset}ms`);
            }
            }

            // change list count
            const countSpan = contentDiv.querySelector('.count [value]');
            if (countSpan) countSpan.textContent = `${Number(countSpan.textContent) + 1}`;

            return result;
        } else throw new Error(`the given "contentDiv" didn't have the required class`);
    }
}
