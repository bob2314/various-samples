import React from 'react';
import ConnectedProgramDetailsSidebar, { ProgramDetailsSidebar } from '../ProgramDetailsSidebar';
import { makeSetupComponent, renderToJSON } from '../../../../utils/tests';
import { ENVIRONMENT } from '../../../../constants';
import * as url from '../../../../utils/parseUrl';
import { doubleClick } from '../../../../utils';

jest.mock('react-gpt', () => ({
  Bling: { enableSingleRequest: () => {} }
}));
jest.mock('../../../ui/sidebar/BeachbodyLiveCta', () => function BeachbodyLiveCta() {});
jest.mock('../../products/ProductCta', () => function ProductCta() {});
jest.mock('../../ProgramDetailsCTA', () => function ProgramDetailsCTA() {});
jest.mock('../../../../utils/baseComponent', () => function baseComponent(WrappedComponent) {
  return props => <WrappedComponent {...props} data-test-baseComponent />;
});
jest.mock('../../../../utils/doubleClick', () => ({
  getIsUserLoggedIn: user => !!user,
  getUserRole: roles => roles,
  getRightRailSizes: () => {}
}));

const setup = makeSetupComponent({
  component: ProgramDetailsSidebar,
  shallow: true
});

const selectors = {
  sectionPromos: '.sectionPromos'
};

describe('ProgramDetailsSidebar component', () => {
  test('connected component renders baseComponent', () => {
    const component = renderToJSON(ConnectedProgramDetailsSidebar, {}, { shallow: true });

    expect(component).toMatchSnapshot();
  });

  test('shows ProductCta with locale', () => {
    const { component } = setup({
      props: {
        locale: 'en_US',
        details: {
          brandCode: '21D',
        },
      }
    });
    expect(component.find('ProductCta').exists()).toBe(ENVIRONMENT.FEATURE_FLAGS.PRODUCT_CTA.isEnabled);
  });

  test('shows ProgramDetailsCTA with props', () => {
    const { component, props } = setup({
      props: {
        details: {
          brandCode: 'BB',
          entitlementGroup: [],
          slug: { foo: 'bar' },
          title: 'test'
        },
        isPremium: true
      }
    });

    expect(component.find('ProgramDetailsCTA').props()).toMatchObject({
      ...props.details,
      isPremium: props.isPremium,
    });
  });

  describe('CTA', () => {
    test('shows if current user is not freeuser', () => {
      const { component } = setup();
      expect(component.find('BeachbodyLiveCta').exists()).toBe(true);
    });

    test('hides if current user is freeuser', () => {
      const { component } = setup({ props: {
        details: { entitlementGroup: [{ slug: 'freeuser' }, { slug: 'unknown' }] }
      } });
      expect(component.find('BeachbodyLiveCta').exists()).toBe(false);
    });
  });

  test('sets proper targeting object for Google Publisher Tags', () => {
    jest.spyOn(url, 'getCurrentSecondPathSegment').mockReturnValueOnce('/path/to/page');
    const { component } = setup({ props: { currentUser: { role: ['user'] } } });
    expect(component.find(selectors.sectionPromos).childAt(0).prop('targeting')).toEqual({
      'url-path': '/path/to/page',
      'is-user-logged-in': true,
      'user-roles': ['user']
    });
    expect(component.find(selectors.sectionPromos).childAt(1).prop('targeting')).toEqual({
      'url-path': '/path/to/page',
      'is-user-logged-in': true,
      'user-roles': ['user']
    });
  });

  test('sets proper adUnitPath for Google Publisher Tags', () => {
    const { component } = setup();
    const path = `/${ENVIRONMENT.DOUBLE_CLICK_ACCOUNT_ID}/bod_pd_right_rail_one`;
    expect(component.find(selectors.sectionPromos).childAt(0).prop('adUnitPath')).toEqual(path);
    expect(component.find(selectors.sectionPromos).childAt(1).prop('adUnitPath')).toEqual(path);
  });

  test('sets proper sizeMapping for Google Publisher Tags', () => {
    const { component } = setup();

    const sizes = doubleClick.getRightRailSizes();

    expect(component.find(selectors.sectionPromos).childAt(0).prop('sizeMapping')).toEqual(sizes);
    expect(component.find(selectors.sectionPromos).childAt(1).prop('sizeMapping')).toEqual(sizes);
  });
});
