import { changePage } from "./src/_shared";
import type { MapPointData } from "./src/map";


export const points: MapPointData[] = [
    {
        x: 0.37, y: 0.68,
        title: 'youtube videos',
        action: () => {
            changePage('vids');
        }
    },
    {
        x: 0.58, y: 0.30,
        title: 'twitch streams',
        action: () => {
            changePage('vods');
        }
    },
];


export const startPos = { x: 0.5, y: 0.5 };
