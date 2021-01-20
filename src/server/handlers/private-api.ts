import express from "express";

import {AxiosResponse} from "axios";

import {Client, QueryResult} from "pg";

import config from "../../config";

import {cache} from "../cache";

import {getTokenUrl, decodeToken} from "../../common/helper/hive-signer";

import {apiRequest, baseApiRequest, getPromotedEntries} from "../helper";

const hs = require("hivesigner");

const validateCode = async (req: express.Request, res: express.Response): Promise<string | false> => {
    const {code} = req.body;

    if (!code) {
        res.status(400).send("Bad Request");
        return false;
    }

    try {
        return await (new hs.Client({accessToken: code}).me().then((r: { name: string }) => r.name));
    } catch (e) {
        return false;
    }
};

const pipe = (promise: Promise<AxiosResponse>, res: express.Response) => {
    promise.then(r => {
        res.status(r.status).send(r.data);
    }).catch(() => {
        res.status(500).send("Server Error");
    });
};

export const receivedVesting = async (req: express.Request, res: express.Response) => {
    const {username} = req.params;
    pipe(apiRequest(`delegatee_vesting_shares/${username}`, "GET"), res);
};

export const leaderboard = async (req: express.Request, res: express.Response) => {
    const {duration} = req.params;
    pipe(apiRequest(`leaderboard?duration=${duration}`, "GET"), res);
};

export const popularUsers = async (req: express.Request, res: express.Response) => {

    let discovery = cache.get("discovery");

    if (discovery === undefined) {
        const client = new Client({
            connectionString: config.hiveUri,
        });

        await client.connect();

        const minReputation = "112985730131325"; // something around 70
        const sql = `SELECT drv3.author AS name, ac.posting_json_metadata AS json_metadata
            FROM (
                   SELECT DISTINCT author
                   FROM (
                          SELECT *
                          FROM (
                                 SELECT
                                   ha_pp.name AS author,  ha_pp.reputation AS author_rep
                                 FROM hive_posts hp
                                   JOIN hive_accounts ha_pp ON ha_pp.id = hp.author_id
                                 WHERE hp.depth = 0
                                 ORDER BY hp.id DESC
                                 LIMIT 10000
                               ) AS drv1
                          WHERE author_rep >= ${minReputation} 
                          ORDER BY author_rep DESC)
                     AS drv2) AS drv3
            LEFT JOIN hive_accounts AS ac ON ac.name = drv3.author
            WHERE ac.posting_json_metadata != '' AND ac.posting_json_metadata != '{}'
            ORDER BY random() LIMIT 260;`

        let r: QueryResult;

        try {
            r = await client.query(sql);
        } catch (e) {
            return res.status(500).send("Server Error");
        } finally {
            await client.end();
        }

        discovery = r.rows.map(x => {
            let json;

            try {
                json = JSON.parse(x.json_metadata);
            } catch (e) {
                return null;
            }

            if (json.profile?.name && json.profile?.about) {
                return {
                    name: x.name,
                    display_name: json.profile.name,
                    about: json.profile.about
                }
            }

            return null;
        }).filter(x => x !== null);

        cache.set("discovery", discovery, 86400);
    }

    return res.send(discovery);
};

export const promotedEntries = async (req: express.Request, res: express.Response) => {
    const posts = await getPromotedEntries();
    res.send(posts);
}

export const commentHistory = async (req: express.Request, res: express.Response) => {
    const {author, permlink, onlyMeta} = req.body;

    let u = `comment-history/${author}/${permlink}`;
    if (onlyMeta === '1') {
        u += '?only_meta=1';
    }

    pipe(apiRequest(u, "GET"), res);
}

export const search = async (req: express.Request, res: express.Response) => {
    const {q, sort, hide_low, since, scroll_id} = req.body;

    const url = `${config.searchApiAddr}/search`;
    const headers = {'Authorization': config.searchApiToken};

    const payload: { q: string, sort: string, hide_low: string, since?: string, scroll_id?: string } = {q, sort, hide_low};

    if (since) payload.since = since;
    if (scroll_id) payload.scroll_id = scroll_id;

    pipe(baseApiRequest(url, "POST", headers, payload), res);
}

export const searchFollower = async (req: express.Request, res: express.Response) => {
    const {q, following} = req.body;

    const url = `${config.searchApiAddr}/search-follower/${following}`;
    const headers = {'Authorization': config.searchApiToken};

    pipe(baseApiRequest(url, "POST", headers, {q: q}), res);
}

export const searchFollowing = async (req: express.Request, res: express.Response) => {
    const {follower, q} = req.body;

    const url = `${config.searchApiAddr}/search-following/${follower}`;
    const headers = {'Authorization': config.searchApiToken};

    pipe(baseApiRequest(url, "POST", headers, {q}), res);
}

export const searchAccount = async (req: express.Request, res: express.Response) => {
    const {q} = req.body;

    const url = `${config.searchApiAddr}/search-account`;
    const headers = {'Authorization': config.searchApiToken};

    pipe(baseApiRequest(url, "POST", headers, {q}), res);
}

export const points = async (req: express.Request, res: express.Response) => {
    const {username} = req.body;
    pipe(apiRequest(`users/${username}`, "GET"), res);
}

export const pointList = async (req: express.Request, res: express.Response) => {
    const {username} = req.body;
    pipe(apiRequest(`users/${username}/points?size=50`, "GET"), res);
}

export const createAccount = async (req: express.Request, res: express.Response) => {
    const {username, email, referral} = req.body;

    const headers = {'X-Real-IP-V': req.headers['x-forwarded-for'] || ''};
    const payload = {username, email, referral};

    pipe(apiRequest(`signup/account-create`, "POST", headers, payload), res);
};

export const hsTokenRefresh = async (req: express.Request, res: express.Response) => {
    const {code} = req.body;
    if (!decodeToken(code)) return;

    pipe(baseApiRequest(getTokenUrl(code, config.hsClientSecret), "GET"), res);
};

/* Login required endpoints */

export const notifications = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;

    const {filter, since} = req.body;

    let u = `activities/${username}`

    if (filter) {
        u = `${filter}/${username}`
    }

    if (since) {
        u += `?since=${since}`;
    }

    pipe(apiRequest(u, "GET"), res);
};

export const unreadNotifications = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;

    pipe(apiRequest(`activities/${username}/unread-count`, "GET"), res);
};

export const markNotifications = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;

    const {id} = req.body;
    const data: { id?: string } = {};

    if (id) {
        data.id = id;
    }

    pipe(apiRequest(`activities/${username}`, "PUT", {}, data), res);
};

export const usrActivity = async (req: express.Request, res: express.Response) => {
    const us = await validateCode(req, res);
    if (!us) return;

    const {ty, bl, tx} = req.body;

    const payload = {us, ty};

    if (bl) payload['bl'] = bl;
    if (tx) payload['tx'] = tx;

    pipe(apiRequest(`usr-activity`, "POST", {}, payload), res);
};

export const images = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;

    pipe(apiRequest(`images/${username}`, "GET"), res);
}

export const imagesDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`images/${username}/${id}`, "DELETE"), res);
}

export const imagesAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {url} = req.body;
    const data = {username, image_url: url};
    pipe(apiRequest(`image`, "POST", {}, data), res);
}

export const drafts = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`drafts/${username}`, "GET"), res);
}

export const draftsAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {title, body, tags} = req.body;
    const data = {username, title, body, tags};
    pipe(apiRequest(`draft`, "POST", {}, data), res);
}

export const draftsUpdate = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id, title, body, tags} = req.body;
    const data = {username, title, body, tags};
    pipe(apiRequest(`drafts/${username}/${id}`, "PUT", {}, data), res);
}

export const draftsDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`drafts/${username}/${id}`, "DELETE"), res);
}

export const bookmarks = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`bookmarks/${username}`, "GET"), res);
}

export const bookmarksAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {author, permlink} = req.body;
    const data = {username, author, permlink, chain: 'steem'};
    pipe(apiRequest(`bookmark`, "POST", {}, data), res);
}

export const bookmarksDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`bookmarks/${username}/${id}`, "DELETE"), res);
}

export const schedules = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`schedules/${username}`, "GET"), res);
}

export const schedulesAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;

    const {permlink, title, body, meta, options, schedule, reblog} = req.body;

    const data = {username, permlink, title, body, meta, options, schedule, reblog: reblog ? 1 : 0};
    pipe(apiRequest(`schedules`, "POST", {}, data), res);
}

export const schedulesDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`schedules/${username}/${id}`, "DELETE"), res);
}

export const schedulesMove = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {id} = req.body;
    pipe(apiRequest(`schedules/${username}/${id}`, "PUT"), res);
}

export const favorites = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`favorites/${username}`, "GET"), res);
}

export const favoritesCheck = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {account} = req.body;
    pipe(apiRequest(`isfavorite/${username}/${account}`, "GET"), res);
}

export const favoritesAdd = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {account} = req.body;
    const data = {username, account};
    pipe(apiRequest(`favorite`, "POST", {}, data), res);
}

export const favoritesDelete = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {account} = req.body;
    pipe(apiRequest(`favoriteUser/${username}/${account}`, "DELETE"), res);
}

export const pointsClaim = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const data = {us: username};
    pipe(apiRequest(`claim`, "PUT", {}, data), res);
}

export const pointsCalc = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {amount} = req.body;
    pipe(apiRequest(`estm-calc?username=${username}&amount=${amount}`, "GET"), res);
}

export const promotePrice = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`promote-price`, "GET"), res);
}

export const promotedPost = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {author, permlink} = req.body;
    pipe(apiRequest(`promoted-posts/${author}/${permlink}`, "GET"), res);
}

export const searchPath = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;

    const {q} = req.body;

    const url = `${config.searchApiAddr}/search-path`;
    const headers = {'Authorization': config.searchApiToken};

    pipe(baseApiRequest(url, "POST", headers, {q}), res);
}

export const boostOptions = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    pipe(apiRequest(`boost-options`, "GET"), res);
}

export const boostedPost = async (req: express.Request, res: express.Response) => {
    const username = await validateCode(req, res);
    if (!username) return;
    const {author, permlink} = req.body;
    pipe(apiRequest(`boosted-posts/${author}/${permlink}`, "GET"), res);
}
