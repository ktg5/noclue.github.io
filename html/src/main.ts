import { twitchgql } from './twitch.js';
import { twitchChannel, ppl, sfx, headingTxts, menuMusic } from '../config.js';
import { calcDateDiffToTxt, changePage, currentPage, pageAttr, scrollOffset, toggleSide, type Elmnt } from './_shared.js';
import { InfoItem } from './info_page.js';


const init = async () => {

    const nav = document.querySelector('#nav') as Elmnt;
    const mainPage_header = document.querySelector(`.page[${pageAttr}="main"] [point-data="welcome"] .title`) as Elmnt;
    const side = document.querySelector('#side') as Elmnt;
    const endPromises: Promise<any>[] = [];


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
    if (mainPage_header) mainPage_header.textContent = headingTxts[lastHeader];
    // set next header
    localStorage.setItem(lastHeaderKey, String(lastHeader + 1));


    // misc sfxs
    setTimeout(() => {
        const mapPoints = document.querySelectorAll('[map-selector="map"] .point');
        mapPoints.forEach((point) => point.addEventListener('pointerup', () => sfx.select.pointer.play()));
    }, 150);


    // navbar buttons
    if (nav) {
        const navContainer = nav.querySelector('.nav-content') as Elmnt;
        if (navContainer) {
            navContainer.childNodes.forEach((btnContainer) => {
                if (btnContainer instanceof HTMLElement) {
                    const btn = btnContainer.querySelector('.btn');
                    if (btn) {
                        const btnAction = btn.getAttribute('btn-action');

                        switch (btnAction) {
                            case 'page':
                                const page = btn.getAttribute(pageAttr);
                                if (page) btn.addEventListener('pointerup', () => {
                                    sfx.select.navbar.play();
                                    if (currentPage()?.getAttribute(pageAttr) !== page) changePage(page);
                                });
                                else {
                                    console.log(btn);
                                    throw new Error(`there is no "${pageAttr}" attr. on the button element above!`);
                                }
                            break;

                            case 'ppl':
                                btn.addEventListener('pointerup', () => toggleSide());
                            break;

                            default:
                                console.warn(`no "btn-action" was found under the name: "${btnAction}"`);
                            break;
                        }
                    }
                }
            });
        }
    }


    // sidebar
    const pplBtn = document.querySelector('#nav .btn[btn-action="ppl"]');
    if (
        pplBtn
        && side
    ) {
        const sideContent = side.querySelector('.side-content') as HTMLElement;
        const sideListContent = sideContent.querySelector('.list') as HTMLElement;

        // sidebar title
        // const titleParts = side.querySelectorAll('.title-part') as NodeListOf<HTMLElement>;
        const titleTexts = side.querySelectorAll('.title-text') as NodeListOf<HTMLElement>;
        titleTexts.forEach((titleText) => {
            const resizeObs = new ResizeObserver(([entry]) => {
                titleText.parentElement?.style.setProperty('--content-width', `${entry.contentBoxSize[0].inlineSize}px`)
            });
            resizeObs.observe(titleText);
        });

        // sidebar content
        type pplKey = keyof typeof ppl;
        for (const key in ppl) {
            if (!Object.hasOwn(ppl, key)) continue;
            const pplKey = key as pplKey;
            const pplData = ppl[pplKey];


            // make element
            const pplElmnt = document.createElement('a');
            pplElmnt.classList.add('list-item');
            pplElmnt.setAttribute('data-ppl', key);
            pplElmnt.tabIndex = -1;
            pplElmnt.innerHTML = `
<div class="list-item-content">
    <div class="shadow"></div>
    <div class="pfp img"><img src="${pplData.pfp !== undefined ? pplData.pfp : ''}"></div>
    <div class="text">
        <span class="name">${pplData.display}</span>
        <div class="desc">
            <span class="desc-content">${pplData.desc}</span>
            <span class="desc-content desc-content-2">${pplData.desc}</span>
        </div>
    </div>
</div>
            `;
            // set site
            if (pplData.site) pplElmnt.href = pplData.site;
            // append
            sideListContent.appendChild(pplElmnt);


            // check if item's desc. needs to scroll due to being too FAT
            const desc = pplElmnt.querySelector('.desc') as HTMLElement;
            const descContent = desc.querySelector('.desc-content') as HTMLElement;
            const descContentWidth = descContent.getBoundingClientRect().width;
            if (desc.getBoundingClientRect().width < descContentWidth) {
                desc.setAttribute('scroll', '');
                desc.style.setProperty('--scroll-ms', `${descContentWidth * scrollOffset}ms`);
            }


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
    }
    else {
        console.error('possible missing divs:', { pplBtn, side });
        throw new Error(`either "pplBtn" or "side" was not found. check the log above`);
    }

    // check if something else that isn't the sidebar is clicked, thus close the sidebar
    document.addEventListener('pointerup', (e) => {
        const eventElmnt = e.target as Elmnt;
        if (eventElmnt) {
            const target = eventElmnt.closest('.side-content');
            if (
                target === null
                && side.getAttribute('active') !== null
                && eventElmnt.closest('[btn-action="ppl"]') === null
            ) toggleSide(false);
        }
    });


    // set media contents
    const currentDate = new Date();
    // twitch vods
    endPromises.push(twitchgql.getChannelMedia(twitchChannel, 'HIGHLIGHT').then((d) => {
        d.forEach((edge) => {
            if (edge.__typename === 'Video') {
                const item = new InfoItem({
                    text: `${calcDateDiffToTxt(currentDate, new Date(edge.publishedAt))} ago - ${edge.title} - ${edge.viewCount} views`,
                    img: edge.previewThumbnailURL,
                    href: `https://twitch.tv/${edge.owner.login}/video/${edge.id}`
                });
                const insertDiv = document.querySelector(`[${pageAttr}="vods"] .info_page-content`) as Elmnt;
                if (insertDiv) item.insert(insertDiv);
            }
        });
    }));
    // youtube vids
    endPromises.push(fetch('https://api.ktg5.online/ytVideos', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            channel: 'noclue'
        })
    }).then(async (d) => {
        const data = (await d.json()) as any[];
        data.forEach((video) => {
            const item = new InfoItem({
                text: `${video.title} - Published ${video.published} - ${video.views} views`,
                img: video.thumbnails.image[0].url,
                href: video.url
            });
            const insertDiv = document.querySelector(`[${pageAttr}="vids"] .info_page-content`) as Elmnt;
            if (insertDiv) item.insert(insertDiv);
        });
    }));


    // progress / click to continue screen
    const progressDiv = document.querySelector('#progress') as Elmnt;
    if (!progressDiv) throw new Error(`the progress div was not found!!! wetpiuhwep[iwernfpwejnlfwejfwelkjfnw]`);
    const progressVid = progressDiv.querySelector('video.preload') as HTMLVideoElement;
    // @ts-ignore
    let progressVidEnded = false;
    const finishVid = progressDiv.querySelector('video.finish') as HTMLVideoElement | null;
    const progressStatus = progressDiv.querySelector('.status') as HTMLSpanElement;

    /// setup
    progressVid.style.opacity = '1';
    progressVid.pause();
    progressVid.currentTime = 0;
    progressStatus.textContent = '';
    progressStatus.style.opacity = '0';
    /// autoplay
    function stepProgressVid(stepMs = 35, timeoutMs = 20) {
        if (progressVid.currentTime !== progressVid.duration) {
            const step = stepMs / 1000;
            progressVid.currentTime = progressVid.currentTime + step;
            setTimeout(() => stepProgressVid(stepMs), timeoutMs);
        }
    }
    stepProgressVid();
    /// when video is autoplaying
    progressVid.addEventListener('timeupdate', () => {
        if (!finishVid) throw new Error(`finish video for preload progress not found!! wtf!!!!!!!`);
        if (progressVid.currentTime === progressVid.duration) {
            progressVid.style.display = 'none';
            finishVid.style.display = 'block';
            progressVidEnded = true;

            setTimeout(() => {
                progressStatus.textContent = 'click anywhere to continue';
                progressStatus.style.opacity = '1';
            }, 1000);
        }
    });
    /// clicking to close
    progressDiv.addEventListener('pointerup', () => {
        if (!finishVid) throw new Error(`finish video for preload progress not found!! wtf!!!!!!!`);
        finishVid.play();
        progressStatus.style.opacity = '0';
        finishVid.addEventListener('ended', () => {
            progressDiv.style.opacity = '0';
            setTimeout(() => {
                progressDiv.style.display = 'none';
            }, 300);
            setTimeout(() => {
                menuMusic.play();
                menuMusic.fade(0, menuMusic.volume(), 8000);
            }, 1000);
        })
    });
    await Promise.all(endPromises);

};


if (document.readyState === 'complete') init();
else window.addEventListener('load', init);
