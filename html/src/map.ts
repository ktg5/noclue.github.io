/**
 * kinda trying to make this something to use for any other
 * web projects i need a map script for
 */

export type Elmnt = HTMLElement | null;
import { points, startPos } from "../mapConfig";
import { pageAttr } from "./_shared";


let map: Elmnt;
let sizes = { vw: 0, vh: 0, mw: 0, mh: 0 };
let mapPos = { x: startPos.x, y: startPos.y };


export type MapPointData = {
    x: number,
    y: number,
    title: string,
    /** data returned is the same data in this map point */
    action?: (data: MapPointData) => any
}
export class MapPoint {
    private elmnt = document.createElement('div');
    private data: MapPointData;


    constructor(data: MapPointData) {
        this.data = data;
        this.elmnt.classList.add('point');
        this.elmnt.style.left = `${data.x * 100}%`;
        this.elmnt.style.top = `${data.y * 100}%`;
        this.elmnt.innerHTML = `
<div class="content-container">
    <div class="pointer"></div>
    <div class="content">
        <span class="title">${data.title}</span>
    </div>
</div>
<div class="visual-point"></div>
        `;
        if (map) map.appendChild(this.elmnt);
        else throw new Error('map element not found!! wtf!!!!!!!!');


        this.elmnt.addEventListener('pointerup', () => {
            if (data.action) data.action(data);
        });
    }


    getData():MapPointData {
        return { ...this.data };
    }
}


export function getMapPos() {
    return { ...mapPos };
}
export function getSizes() {
    return { ...sizes };
}


function clampPos(pos: number, viewportSize: number, mapSize: number) {
    if (
        mapSize <= viewportSize
        || mapSize === 0
    ) return 0.5;

    const half = viewportSize / (2 * mapSize);
    return Math.min(Math.max(pos, half), 1 - half);
}
function clampMapPos(x: number, y: number) {
    return {
        x: clampPos(x, sizes.vw, sizes.mw),
        y: clampPos(y, sizes.vh, sizes.mh),
    };
}
/**
 * makes sure `mapSize` doesn't go outside of `viewportSize` 
 */
function clampformAxis(desired: number, viewportSize: number, mapSize: number) {
    if (mapSize <= viewportSize) return (viewportSize - mapSize) / 2;
    const min = viewportSize - mapSize;
    const max = 0;
    return Math.min(Math.max(desired, min), max);
}

/**
 * set map positioning via setting a transform CSS value onto the `map`
 * @returns transform CSS value set to the `map`, ie: `translate(0px, 0px)`
 */
function setMapTrans() {
    if (!map) return;
 
    const pointX = mapPos.x * sizes.mw;
    const pointY = mapPos.y * sizes.mh;
    const targetX = sizes.vw / 2;
    const targetY = sizes.vh / 2;
 
    // guys calc is short for calculator btw
    const tx = clampformAxis(targetX - pointX, sizes.vw, sizes.mw);
    const ty = clampformAxis(targetY - pointY, sizes.vh, sizes.mh);
 
    let transString = `translate(${tx}px, ${ty}px)`;
    map.style.transform = transString;
    return transString;
}

/**
 * set map position manually. Values are clamped 
 */
export function setMapPos(x: number, y: number) {
    const clamped = clampMapPos(x, y);
    mapPos.x = clamped.x;
    mapPos.y = clamped.y;
    setMapTrans();
}

/**
 * script resize function
 */
function onResize() {
    const viewport = document.querySelector(`.page[${pageAttr}="main"]`) as Elmnt;
    if (
        !viewport
        || !map
    ) {
        throw new Error('viewport element not found!! wtf!!!!!!!!!!');
    }
 
    sizes = {
        vw: viewport.clientWidth,
        vh: viewport.clientHeight,
        mw: map.offsetWidth,
        mh: map.offsetHeight,
    };

    const clamped = clampMapPos(mapPos.x, mapPos.y);
    mapPos.x = clamped.x;
    mapPos.y = clamped.y;
 
    setMapTrans();
}
 
const init = async () => {
    const viewport = document.querySelector(`.page[${pageAttr}="main"]`) as Elmnt;
 
    if (viewport) {
        map = viewport.querySelector('[map-selector="map"]') as Elmnt;
        if (map) {
 
            // init map points
            points.forEach((point) => new MapPoint(point));
 
            // resize
            new ResizeObserver(onResize).observe(map);
            new ResizeObserver(onResize).observe(viewport);
            onResize();
 
            // drag to move map
            const onMouseDown = (e: MouseEvent) => {
                if (!map) return;
                if (
                    e.target
                    && (e.target as HTMLElement).closest('.pointer') !== null
                    && (e.target as HTMLElement).closest('.custom-pointer') !== null
                ) return;

                e.preventDefault();

                map.style.cursor = 'grabbing';

                map.addEventListener('pointermove', onMouseMove);
                map.addEventListener('pointercancel', killMouseMove);
                map.addEventListener('pointerup', killMouseMove);
                document.addEventListener('pointerleave', killMouseMove);
            };
            map.addEventListener('pointerdown', onMouseDown);
            const onMouseMove = (e: MouseEvent) => {
                if (
                    sizes.mw === 0
                    || sizes.mh === 0
                ) return;

                e.preventDefault();
 
                const currentPos = getMapPos();
 
                setMapPos(
                    currentPos.x - (e.movementX / sizes.mw),
                    currentPos.y - (e.movementY / sizes.mh)
                );
            };
            const killMouseMove = () => {
                if (!map) return;

                map.style.cursor = '';

                map.removeEventListener('pointermove', onMouseMove);
                map.removeEventListener('pointercancel', killMouseMove);
                map.removeEventListener('pointerup', killMouseMove);
                document.removeEventListener('pointerleave', killMouseMove);
            };
            map.addEventListener('contextmenu', killMouseMove);
 
        } else throw new Error('the map has something wrong with itself');
    } else throw new Error('the map has something wrong with itself');
};


if (document.readyState === 'complete') init();
else window.addEventListener('load', init);
