import { Howl, type HowlOptions } from 'howler'

// preload loading stuff can be here
import ktg5pfp from './img/ppl/ktg5.png';
import malapfp from './img/ppl/malatype.png';
import skppypfp from './img/ppl/skppy.png';


export const twitchChannel = 'noclue_collective';


// headings
export const headingTxts = [
    `this is noclue and we're awesome`,
    `noclue is a really stupid group`,
    `and we play sledge`,
    `PRO LEAGUE MLG TRICKSHOTTING`,
    `we only listen to country and edm`,
    `You can download it from the links in the description`,
    `LET'S GO TEAM!`,
    `we can sense estrogen`,
];


// don't delete this
const howlDef: HowlOptions = {
    src: '',
    autoplay: false,
    preload: true,
    volume: 1
}
export const menuMusic = new Howl({
    ...howlDef,
    src: (await import('./misc/music/menu.mp3')).default,
    volume: 1,
    loop: true
});
export const sfx = {
    select: {
        pointer: new Howl({
            ...howlDef,
            src: (await import('./misc/sound/select-pointer.mp3')).default,
        }),
        navbar: new Howl({
            ...howlDef,
            src: (await import('./misc/sound/select-navbar.mp3')).default,
        }),
        submenu: new Howl({
            ...howlDef,
            src: (await import('./misc/sound/select-submenu.mp3')).default,
        }),
        menuitem: new Howl({
            ...howlDef,
            src: (await import('./misc/sound/select-menuitem.mp3')).default,
        })
    },
    sidemenu: new Howl({
        ...howlDef,
        src: (await import('./misc/sound/sidemenu.mp3')).default,
    }),
    back: new Howl({
        ...howlDef,
        src: (await import('./misc/sound/back.mp3')).default,
    }),
    mission: new Howl({
        ...howlDef,
        src: (await import('./misc/sound/missioninfo.mp3')).default,
    })
}


// people
type PplDetails = {
    display: string,
    desc: string,
    twitch: string,
    site?: string,
    pfp?: string,
}

export const ppl: Record<string, PplDetails> = {
    ktg5: {
        display: "ktg5",
        desc: "DUMBASS STUPID IDIOT STUPID STUPID",
        twitch: "ktg5_",
        site: "https://ktg5.online/",
        pfp: ktg5pfp
    },
    shobe: {
        display: "shobe",
        desc: "that one vtuber that streams minecraft modpacks",
        twitch: "shobuh",
        site: "https://youtube.com/@shobuh"
    },
    mala: {
        display: "Malatype",
        desc: "very loud",
        twitch: "malatype",
        site: "https://youtube.com/@malatype",
        pfp: malapfp
    },
    skppy: {
        display: "Skppy",
        desc: "actual crackhead that pirates movies",
        twitch: "skppy_",
        site: "https://youtube.com/@Skppydip",
        pfp: skppypfp
    },
};
