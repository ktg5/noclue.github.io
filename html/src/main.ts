import ppl, { type pplKey } from './ppl.js';
import { twitchgql } from './twitch.js';
import headingTxts from '../headingTxts.js';


const twitchChannel = 'noclue_collective';


/**
 * Date difference into text
 * @param date1 Most recent date
 * @param date2 Oldest date
 */
function calcDateDiffToTxt(date1 = new Date, date2 = new Date) {
    let diffMs = date1.getTime() - date2.getTime();
    let diffSeconds = diffMs / 1000;
    let diffMinutes = diffSeconds / 60;
    let diffHours = diffMinutes / 60;
    let diffDays = diffHours / 24;
    let diffWeeks = diffDays / 7;
    let diffMonths = diffWeeks / 4;
    let diffYears = diffMonths / 12;
    console.log(diffYears);

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


window.addEventListener('load', async () => {

    type Elmnt = HTMLElement | null;
    const nav = document.querySelector('#nav') as Elmnt;
    const aboutPage = document.querySelector('#about_page') as Elmnt;
    const header = document.querySelector('#about_page .l .title') as Elmnt;
    const ppls = document.querySelector('#persons') as Elmnt;
    const media = document.querySelector('#media_page .container') as Elmnt;


    // scrolling
    window.addEventListener('scroll', () => {
        if (
            aboutPage === null
            || nav === null
        ) return;
        if (window.scrollY > (aboutPage.clientHeight - nav.clientHeight)) {
                nav.classList.remove('rm-bg');
        } else nav.classList.add('rm-bg');
    }, { passive: true });


    // change header text
    const lastHeaderKey = 'lastheader';
    let lastHeader = Number(localStorage.getItem(lastHeaderKey));
    if (
        localStorage.getItem(lastHeaderKey) === null
        || lastHeader < 0
        || lastHeader > headingTxts.length - 1
    ) {
        localStorage.setItem(lastHeaderKey, '0');
        lastHeader = 0;
    }
    if (header) header.textContent = headingTxts[lastHeader];
    // set next header
    localStorage.setItem(lastHeaderKey, String(lastHeader + 1));


    // set media contents
    if (media) {
        const mediaPromises: Promise<any>[] = [];
        const currentDate = new Date();

        media.childNodes.forEach((grid) => {
            // make sure this elmnt is a .grid
            if (
                grid instanceof HTMLElement
                && grid.classList.contains('grid')
            ) {
                // create grid item
                function createItem() {
                    const gridItem = document.createElement('a');
                    gridItem.classList.add('item');
                    gridItem.innerHTML = `
<div class="img"><img src=""></div>
<div class="info">
    <div class="name"></div>
    <div class="data">
        <span class="date"></span>
        <div class="spacer"></div>
        <span class="views"></span>
    </div>
</div>
                    `;
                    return gridItem;
                }

                const gridType = grid.getAttribute('grid-type');
                switch (gridType) {
                    case 'vods':
                        mediaPromises.push(twitchgql.getChannelMedia(twitchChannel, 'HIGHLIGHT').then((d) => {
                            d.forEach((edge) => {
                                if (edge.__typename === 'Video') {
                                    const gridItem = createItem();
                                    gridItem.href = `https://twitch.tv/${edge.owner.login}/video/${edge.id}`;
                                    gridItem.title = edge.title;
                                    (gridItem.querySelector('.img img') as HTMLImageElement).src = edge.previewThumbnailURL;
                                    (gridItem.querySelector('.name') as HTMLElement).textContent = edge.title;
                                    (gridItem.querySelector('.data .date') as HTMLElement).textContent = `${calcDateDiffToTxt(currentDate, new Date(edge.publishedAt))} ago`;
                                    (gridItem.querySelector('.data .views') as HTMLElement).textContent = `${edge.viewCount} views`;
                                    grid.querySelector('.content-container .content')?.appendChild(gridItem);
                                }
                            });
                        }));
                    break;
                
                    default:
                        console.warn(`couldn't figure out what to do with gridType "${gridType}"`);
                    break;
                }
            }
        });


    }


    // ppl elements
    const endPromises: Promise<any>[] = [];
    if (ppls === null) throw new Error('the "persons" div is not found! wtf!!!!');
    for (const key in ppl) {
        if (!Object.hasOwn(ppl, key)) continue;
        const pplKey = key as pplKey;
        const pplData = ppl[pplKey];


        // make element
        const pplElmnt = document.createElement('a');
        pplElmnt.classList.add('person');
        pplElmnt.setAttribute('data-ppl', key);
        pplElmnt.tabIndex = 0;
        pplElmnt.innerHTML = `
<div class="pfp img"><img src="${pplData.pfp !== undefined ? pplData.pfp : ''}"></div>
<div class="info">
    <div class="name">${pplData.display}</div>
    <div class="desc">${pplData.desc}</div>
</div>
        `;
        // set site
        if (pplData.site) pplElmnt.href = pplData.site;
        // append
        ppls.appendChild(pplElmnt);


        // twitch stuff
        if (
            pplData.twitch
            && pplElmnt !== null
        ) {
            endPromises.push(twitchgql.getChannel(pplData.twitch).then((d) => {
                // add pfp from data
                if (!pplData.pfp) (pplElmnt.querySelector('.pfp img') as HTMLImageElement).src = d.profileImageURL;
                // add lil' live indicator
                if (d.live) pplElmnt.classList.add('ttv-live');
            }));
        }
    }


    // end
    // proomises
    await Promise.all(endPromises);

});
