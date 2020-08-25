import {combineReducers} from "redux";
import {connectRouter} from "connected-react-router";
import {createBrowserHistory, History} from "history";

import isEqual from "react-fast-compare";

import global from "./global";
import dynamicProps from "./dynamic-props";
import trendingTags from "./trending-tags";
import community from "./community";
import entries from "./entries";
import accounts from "./accounts";
import transactions from "./transactions";
import users from "./users";
import activeUser from "./active-user";
import reblogs from "./reblogs";
import discussion from "./discussion";
import ui from "./ui";
import subscriptions from "./subscriptions";
import notifications from "./notifications";
import points from "./points";
import signingKey from "./signing-key";

import filterTagExtract from "../helper/filter-tag-extract";

let reducers = {
    global,
    dynamicProps,
    trendingTags,
    community,
    entries,
    accounts,
    transactions,
    users,
    activeUser,
    reblogs,
    discussion,
    ui,
    subscriptions,
    notifications,
    points,
    signingKey
};

export let history: History | undefined;

// create browser history on client side
if (typeof window !== "undefined") {
    history = createBrowserHistory();

    // We need a customised history object since history pushes new state for same path.
    // See: https://github.com/ReactTraining/history/issues/470
    // We don't want LOCATION_CHANGE triggered for same path because of structure of out "entries" reducer.

    // get ref of current push function
    const _push = history.push;

    let prevPath: string = history.location.pathname;
    // update previous path once history change
    history.listen(location => {
        prevPath = location.pathname;
    });

    // create a new push function that compares new path and previous path.
    history.push = (pathname: History.Path, state: History.LocationState = {}) => {

        // compare filter & tag resolution of paths
        // this control required because "/" == "/hot" and "/@username" == "/@username/posts"
        const ftCur = filterTagExtract(pathname);
        const ftPrev = filterTagExtract(prevPath);

        if (ftCur && ftPrev) {
            if (isEqual(ftCur, ftPrev)) {
                return;
            }
        }

        // simple path compare
        if (pathname === prevPath) {
            return;
        }

        _push(pathname, state);
    }

    // @ts-ignore
    reducers = {router: connectRouter(history), ...reducers};
}

const rootReducer = combineReducers(reducers);

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;
