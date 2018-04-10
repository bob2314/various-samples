// @flow weak
// Dependencies
import Component from 'react-pure-render/component';
import PropTypes from 'prop-types';
import React from 'react';
import { Bling as GooglePublisherTag } from 'react-gpt';

import ProgramDetailsCTA from '../ProgramDetailsCTA';
import ProductCta from '../products/ProductCta';
import BeachbodyLiveCta from '../../ui/sidebar/BeachbodyLiveCta';

import { ENVIRONMENT, LOCALE } from '../../../constants';

import {
  baseComponent,
  doubleClick,
  formatStyles
} from '../../../utils';
import { getCurrentSecondPathSegment as getCurrentUrlSecondPathSegment } from '../../../utils/parseUrl';

import styles from './ProgramDetailsSidebar.scss';

GooglePublisherTag.enableSingleRequest();

export class ProgramDetailsSidebar extends Component {
  static propTypes = {
    className: PropTypes.string,
    currentUser: PropTypes.object,
    details: PropTypes.object,
    locale: PropTypes.string,
    isPremium: PropTypes.bool,
    tealium: PropTypes.object
  };

  productCtaWhiteListByBrandCode = ['21D']

  render() {
    const {
      className,
      currentUser,
      details: {
        title,
        slug,
        brandCode,
        entitlementGroup = [],
      } = {},
      isPremium,
      locale,
      currentUser: {
        role: roles = []
      } = {},
      tealium,
    } = this.props;

    const { DEFAULT_LOCALE: US } = LOCALE;
    const { ProgramDetailsSidebar } = styles;
    const urlPath = getCurrentUrlSecondPathSegment();
    const isUserLoggedInString = doubleClick.getIsUserLoggedIn(currentUser);
    const userRole = doubleClick.getUserRole(roles);
    const isLocaleUsa = locale === US;
    const isProgramEligibleForProductCta = this.productCtaWhiteListByBrandCode.includes(brandCode);
    const isProductCtaEnabled = ENVIRONMENT.FEATURE_FLAGS.PRODUCT_CTA.isEnabled || false;

    const isProductCtaVisible = (
      isProductCtaEnabled &&
      isLocaleUsa &&
      isProgramEligibleForProductCta
    );

    let freeUser = false;
    entitlementGroup.map((obj) => {
      if (obj.slug === 'freeuser') {
        freeUser = true;
        return false;
      }
      return obj;
    });

    let Cta = (
      <BeachbodyLiveCta
        {...{
          tealium,
          tealiumKey: 'lnk_beachbodylive-find-a-class'
        }}
      />
    );
    if (freeUser) {
      Cta = '';
    }

    return (
      <div className={formatStyles(ProgramDetailsSidebar, className)}>
        <div className={formatStyles(styles.section)}>
          <ProgramDetailsCTA
            title={title}
            entitlementGroup={entitlementGroup}
            isPremium={isPremium}
            brandCode={brandCode}
            slug={slug}
          />
        </div>
        <div className={formatStyles(styles.section, styles.sectionShort)}>
          {Cta}
        </div>
        <div className={formatStyles(styles.section, styles.sectionPromos)}>
          <GooglePublisherTag
            adUnitPath={`/${ENVIRONMENT.DOUBLE_CLICK_ACCOUNT_ID}/bod_pd_right_rail_one`}
            collapseEmptyDiv
            sizeMapping={doubleClick.getRightRailSizes()}
            targeting={{
              'url-path': urlPath,
              'is-user-logged-in': isUserLoggedInString,
              'user-roles': userRole
            }}
            renderWhenViewable={false}
          />
          <GooglePublisherTag
            adUnitPath={`/${ENVIRONMENT.DOUBLE_CLICK_ACCOUNT_ID}/bod_pd_right_rail_one`}
            collapseEmptyDiv
            sizeMapping={doubleClick.getRightRailSizes()}
            targeting={{
              'url-path': urlPath,
              'is-user-logged-in': isUserLoggedInString,
              'user-roles': userRole
            }}
            renderWhenViewable={false}
          />
        </div>
        {isProductCtaVisible && (
          <ProductCta
            tealium={tealium}
            pageName="21-day-fix"
            pageType="program-details"
            siteSection="programs"
          />
        )}
      </div>
    );
  }
}

export default baseComponent(ProgramDetailsSidebar);
