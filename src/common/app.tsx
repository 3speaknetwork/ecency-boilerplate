import React from "react";
import { Route, Switch } from "react-router-dom";

import EntryIndexContainer from "./pages/entry-index";
import ProfileContainer from "./pages/profile";
import EntryContainer from "./pages/entry";
import {
  AboutPageContainer,
  GuestPostPageContainer,
  ContributePageContainer,
  PrivacyPageContainer,
  WhitePaperPageContainer,
  TosPageContainer,
} from "./pages/static";

import routes from "./routes";

const App = () => {
  return (
    <>
      <Switch>
        <Route exact={true} path={routes.HOME} component={EntryIndexContainer} />
        <Route exact={true} strict={true} path={routes.FILTER} component={EntryIndexContainer} />
        <Route exact={true} strict={true} path={routes.FILTER_TAG} component={EntryIndexContainer} />
        <Route exact={true} strict={true} path={routes.USER} component={ProfileContainer} />
        <Route exact={true} strict={true} path={routes.USER_SECTION} component={ProfileContainer} />
        <Route exact={true} strict={true} path={routes.ENTRY} component={EntryContainer} />

        <Route exact={true} path={routes.ABOUT} component={AboutPageContainer} />
        <Route exact={true} path={routes.GUESTS} component={GuestPostPageContainer} />
        <Route exact={true} path={routes.CONTRIBUTE} component={ContributePageContainer} />
        <Route exact={true} path={routes.PRIVACY} component={PrivacyPageContainer} />
        <Route exact={true} path={routes.WHITE_PAPER} component={WhitePaperPageContainer} />
        <Route exact={true} path={routes.TOS} component={TosPageContainer} />

        {/*  <Route exact={true} path={routes.SIGN_UP} component={SignUpPageContainer} /> */}
      </Switch>
    </>
  );
};

export default App;
