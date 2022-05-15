import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import EntryIndexContainer from './pages/index';
import EntryContainer from './pages/entry';
import CommunitiesContainer, { CommunityCreateContainer, CommunityCreateHSContainer } from './pages/communities';
import { SearchPageContainer, SearchMorePageContainer } from './pages/search';
import { ProposalsIndexContainer, ProposalDetailContainer } from './pages/proposals';
import NotFound from './components/404';

import Tracker from './tracker';

import {
  AboutPageContainer,
  GuestPostPageContainer,
  ContributePageContainer,
  PrivacyPageContainer,
  WhitePaperPageContainer,
  TosPageContainer,
  FaqPageContainer,
  ContributorsPageContainer
} from './pages/static';

import routes from './routes';
import * as ls from './util/local-storage';

import i18n from 'i18next';
import { pageMapDispatchToProps, pageMapStateToProps } from './pages/common';
import { connect } from 'react-redux';
import loadable from '@loadable/component';

// Define lazy pages
const ProfileContainer = loadable(() => import('./pages/profile'));
const ProfilePage = (props: any) => <ProfileContainer {...props} />;

const CommunityContainer = loadable(() => import('./pages/community'));
const CommunityPage = (props: any) => <CommunityContainer {...props} />;

const DiscoverContainer = loadable(() => import('./pages/discover'));
const DiscoverPage = (props: any) => <DiscoverContainer {...props} />;

const WitnessesContainer = loadable(() => import('./pages/witnesses'));
const WitnessesPage = (props: any) => <WitnessesContainer {...props} />;

const AuthContainer = loadable(() => import('./pages/auth'));
const AuthPage = (props: any) => <AuthContainer {...props} />;

const SubmitContainer = loadable(() => import('./pages/submit'));
const SubmitPage = (props: any) => <SubmitContainer {...props} />;

const MarketContainer = loadable(() => import('./pages/market'));
const MarketPage = (props: any) => <MarketContainer {...props} />;

const SignUpContainer = loadable(() => import('./pages/sign-up'));
const SignUpPage = (props: any) => <SignUpContainer {...props} />;

const App = ({ setLang }: any) => {
  useEffect(() => {
    let pathname = window.location.pathname;
    if (pathname !== '/faq') {
      const currentLang = ls.get('current-language');
      if (currentLang) {
        setLang(currentLang);
        i18n.changeLanguage(currentLang)
      }
    }
  }, []);

  return (
    <>
      <Tracker/>
      <Switch>
        <Route exact={true} path={routes.HOME} component={EntryIndexContainer}/>
        <Route exact={true} strict={true} path={routes.FILTER} component={EntryIndexContainer}/>
        <Route exact={true} strict={true} path={routes.USER_FEED} component={EntryIndexContainer}/>
        <Route exact={true} strict={true} path={routes.USER} component={ProfilePage}/>
        <Route exact={true} strict={true} path={routes.USER_SECTION} component={ProfilePage}/>
        <Route exact={true} strict={true} path={routes.ENTRY} component={EntryContainer}/>
        <Route exact={true} strict={true} path={routes.COMMUNITIES} component={CommunitiesContainer}/>
        <Route exact={true} strict={true} path={routes.COMMUNITIES_CREATE} component={CommunityCreateContainer}/>
        <Route exact={true} strict={true} path={routes.COMMUNITIES_CREATE_HS} component={CommunityCreateHSContainer}/>
        <Route exact={true} strict={true} path={routes.COMMUNITY} component={CommunityPage}/>
        <Route exact={true} strict={true} path={routes.FILTER_TAG} component={EntryIndexContainer}/>
        <Route exact={true} strict={true} path={routes.DISCOVER} component={DiscoverPage}/>
        <Route exact={true} path={routes.SEARCH} component={SearchPageContainer}/>
        <Route exact={true} path={routes.SEARCH_MORE} component={SearchMorePageContainer}/>
        <Route exact={true} strict={true} path={routes.AUTH} component={AuthPage}/>
        <Route exact={true} strict={true} path={routes.SUBMIT} component={SubmitPage}/>
        <Route exact={true} strict={true} path={routes.MARKET} component={MarketPage}/>
        <Route exact={true} strict={true} path={routes.EDIT} component={SubmitPage}/>
        <Route exact={true} strict={true} path={routes.SIGN_UP} component={SignUpPage}/>
        <Route exact={true} strict={true} path={routes.EDIT_DRAFT} component={SubmitPage}/>
        <Route exact={true} strict={true} path={routes.WITNESSES} component={WitnessesPage}/>
        <Route exact={true} strict={true} path={routes.PROPOSALS} component={ProposalsIndexContainer}/>
        <Route exact={true} strict={true} path={routes.PROPOSAL_DETAIL} component={ProposalDetailContainer}/>
        <Route exact={true} strict={true} path={routes.ABOUT} component={AboutPageContainer}/>
        <Route exact={true} strict={true} path={routes.GUESTS} component={GuestPostPageContainer}/>
        <Route exact={true} strict={true} path={routes.CONTRIBUTE} component={ContributePageContainer}/>
        <Route exact={true} strict={true} path={routes.PRIVACY} component={PrivacyPageContainer}/>
        <Route exact={true} strict={true} path={routes.WHITE_PAPER} component={WhitePaperPageContainer}/>
        <Route exact={true} strict={true} path={routes.TOS} component={TosPageContainer}/>
        <Route exact={true} strict={true} path={routes.FAQ} component={FaqPageContainer}/>
        <Route exact={true} strict={true} path={routes.CONTRIBUTORS} component={ContributorsPageContainer}/>
        <Route component={NotFound}/>
      </Switch>
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(App);
