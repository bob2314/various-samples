// @flow weak
// Dependencies
import Component from 'react-pure-render/component';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Link from '../../ui/link/Link';
import { getUpgradePath } from '../../user';
import { baseComponent, formatStyles, strings } from '../../../utils';
import { exists } from '../../../utils/utils';
import injectEntitlements from '../../user/profile/injectEntitlements';
import styles from './ProgramDetailsCTA.scss';
import AmazonModal from '../../../components/amazon-registration/AmazonModal';
import { parseImmutableStore } from '../../../utils/immutable';

const { parseHtml } = strings;

export class ProgramDetailsCTA extends Component<$FlowFixMeProps> {
  static propTypes = {
    className: PropTypes.string,
    currentUser: PropTypes.object,
    title: PropTypes.string,
    brandCode: PropTypes.string,
    profileStatus: PropTypes.string,
    slug: PropTypes.string,
    entitlements: PropTypes.arrayOf(PropTypes.string),
    currentProgram: PropTypes.object,
    isEntitled: PropTypes.bool,
    isPremium: PropTypes.bool,
    tealium: PropTypes.object,
    entitlementGroup: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = { modal: false };
  }
  render() {
    const {
      className,
      currentUser,
      currentUser: { role = [] } = {},
      title,
      profileStatus,
      isEntitled,
      tealium,
      entitlementGroup
    } = this.props;

    let { isPremium } = this.props;
    let freeProgram = false;
    let megatronUser = false;
    if (entitlementGroup) {
      entitlementGroup.map((obj) => {
        if (obj.slug === 'freeuser') {
          freeProgram = true;
          return false;
        }
        return obj;
      });
    }

    if (role.includes('REGISTEREDUSER') && !role[1]) {
      megatronUser = true;
    }
    if (role.includes('REGISTEREDUSER') || role.includes('CLUB') ||
      role.includes('UKCLUB')) {
      isPremium = true;
    }

    const upgradeURL = getUpgradePath(role, isPremium);

    const { ProgramDetailsCTA } = styles;
    const isLoggedIn = !!currentUser;
    const style = formatStyles(ProgramDetailsCTA, className);
    const productDescription = parseHtml(
      `Get access to <span class="bold">${title}</span> and <span class="bold">600+</span> Beachbody workouts and more.`
    );
    const productDescriptionPremiumLI = parseHtml(
      `Get access to <span class="bold">${title}</span> and <span class="bold">600+</span> Beachbody workouts and more by upgrading to All Access.`
    );

    const libraryLO =
      (<div className={style}>
        <p>
          {productDescription}
        </p>
        <Link
          to={upgradeURL}
          className="button large"
          data-tealium-key="lnk_pgmdetail_cta-sidebar-getallaccess"
          onClick={(e) => {
            tealium.event(
              exists(tealium.bodLinkAnalytics, 'lnk_pgmdetail_cta-sidebar-getallaccess'),
              e.target
            );
          }}
        >
          {'UPGRADE'}
        </Link>
      </div>);
    const premiumEntitledLI = null;
    const premiumLO = (<div className={style}>
      <p>
        {productDescription}
      </p>
      <Link
        to={getUpgradePath(role, isPremium)}
        className="button large"
        data-tealium-key="lnk_pgmdetail_cta-sidebar-getallaccess"
        onClick={(e) => {
          tealium.event(
            exists(tealium.bodLinkAnalytics, 'lnk_pgmdetail_cta-sidebar-getallaccess'),
            e.target
          );
        }}
      >
        {'GET ALL ACCESS'}
      </Link>
    </div>);
    const premiumLI =
      (<div className={style}>
        <p>
          {productDescriptionPremiumLI}
        </p>
        <Link
          to={upgradeURL}
          className="button large"
        >
          {'UPGRADE'}
        </Link>
      </div>);
    if (profileStatus === 'fetching') return null;
    if (isLoggedIn) {
      if (isPremium && isEntitled) { // Paid Logged In User
        return premiumEntitledLI;
      }
      if (megatronUser && freeProgram) { // Free Logged In User in a Free Program
        return libraryLO;
      }
      /* istanbul ignore else */
      if (megatronUser && !freeProgram) { // Free Logged In User in a No Free Program
        return premiumLI;
      }
    } else if (!isLoggedIn && freeProgram) { // Any Logged Out User
      return (
        <AmazonModal
          mode="cta"
          title={title}
          tealiumKey="lnk_pgmdetail_cta-sidebar-freeacct"
          config={{
            show: false
          }}
        />);
    } else {
      return premiumLO;
    }
    // [Anton Orlov] this code is unreachable
    /* istanbul ignore next */
    return libraryLO;
  }
}

export default compose(connect(state => ({
  currentUser: state.user.currentUser,
  entitlements: parseImmutableStore(state.profile.entitlements),
  profileStatus: state.profile.status
})), injectEntitlements, baseComponent)(ProgramDetailsCTA);
