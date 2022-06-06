import {Request, Response} from "express";

import {AppState} from "../../common/store";
import {Entry} from "../../common/store/entries/types";

import * as bridgeApi from "../../common/api/bridge";

import {makePreloadedState} from "../state";

import {render} from "../template";
import dmca from '../../common/constants/dmca.json';
import { getAsAMP } from '../services';
import { getPost } from '../../common/api/hive';

export default async (req: Request, res: Response) => {
    const {category, author, permlink} = req.params;
    let entry: Entry | null = null;

    if (permlink.indexOf('.')>-1) {
        console.error(`${new Date().toISOString()} ERROR permlink @${author}/${permlink}`);
    } else {
        try {
            entry = await bridgeApi.getPost(author, permlink);
        } catch (e) {
            console.error(`${new Date().toISOString()} ${bridgeApi.bridgeServer?.currentAddress} ERROR fetching @${author}/${permlink}`);
        }    
    }

    let entries = {};

    if (entry) {
        if (dmca.some((rx:string) => new RegExp(rx).test(`${entry?.author}/${entry?.permlink}`))) {
            entry.body = "This post is not available due to a copyright/fraudulent claim.";
            entry.title = "";
        }
        if (!category) {
            res.redirect(`/${entry.category}/@${author}/${permlink}`);
            return;
        }

        entries = {
            [`__manual__`]: {
                entries: [entry],
                error: null,
                loading: false,
                hasMore: true,
            },
        };
    }

    const state = await makePreloadedState(req);

    const preLoadedState: AppState = {
        ...state,
        global: {
            ...state.global,
        },
        entries: {
            ...state.entries,
            ...entries
        },
    };
    const { amp } = req.query;

    if (amp) {
        let ignoreCache = false;
        let identifier = `${category}_${author}_${permlink}`;
        try {
            const entry = await getPost(author, permlink);
            identifier += `_${entry.last_update}`;
        } catch (e) {
            ignoreCache = true;
        }
        const ampResult = await getAsAMP(identifier, req, preLoadedState, ignoreCache);
        res.send(ampResult);
        return;
    }

    res.send(render(req, preLoadedState));
};
