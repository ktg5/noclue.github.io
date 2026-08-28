import ktg5pfp from '../img/ppl/ktg5.png';
import malapfp from '../img/ppl/malatype.png';
import skppypfp from '../img/ppl/skppy.png';


type PplDetails = {
    display: string,
    desc: string,
    twitch: string,
    site?: string,
    pfp?: string,
}

const ppl: Record<string, PplDetails> = {
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
        twitch: "malatyp3",
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


export default ppl;
export type pplKey = keyof typeof ppl;
