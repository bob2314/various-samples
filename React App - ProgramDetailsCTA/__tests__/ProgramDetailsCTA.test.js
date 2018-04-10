import ConnectedProgramDetailsCTA, { ProgramDetailsCTA } from '../ProgramDetailsCTA';
import { makeSetupComponent } from '../../../../utils/tests';

jest.mock('../../../ui/link/Link', () => function Link() {});
jest.mock('../../../amazon-registration/AmazonModal', () => function AmazonModal() {});

const setup = makeSetupComponent({
  includeBaseComponentState: true,
  reduxState: {
    profile: {
      entitlements: [],
      status: ''
    }
  },
  component: ProgramDetailsCTA,
  shallow: true
});

describe('ProgramDetailsCTA component', () => {
  test('selects proper state from store', () => {
    const { component, store } = setup({ component: ConnectedProgramDetailsCTA });

    const props = component.props();
    const state = store.getState();

    expect(props.entitlements).toEqual(state.profile.entitlements);
    expect(props.profileStatus).toEqual(state.profile.status);
  });

  describe('for not logged in and not free users', () => {
    test('shows Get All Access link', () => {
      const { component } = setup();
      expect(component.find('Link').children().text()).toBe('GET ALL ACCESS');
    });

    test('logs tealium event on link click', () => {
      const event = jest.fn();
      const { component } = setup({
        props: {
          tealium: {
            event,
            bodLinkAnalytics: {
              'lnk_pgmdetail_cta-sidebar-getallaccess': 'testLink'
            }
          }
        }
      });

      component.find('Link').simulate('click', { target: 'allAccess' });
      expect(event).toBeCalledWith('testLink', 'allAccess');
    });
  });

  describe('for logged in, entitled and premium users', () => {
    test('renders null for US/CA users', () => {
      const { component } = setup({
        props: {
          isEntitled: true,
          currentUser: { role: ['REGISTEREDUSER', 'CLUB'] }
        }
      });
      expect(component.html()).toBe(null);
    });

    test('renders null for UK users', () => {
      const { component } = setup({
        props: {
          isEntitled: true,
          currentUser: { role: ['REGISTEREDUSER', 'UKCLUB'] }
        }
      });
      expect(component.html()).toBe(null);
    });
  });

  describe('for logged in, megatron and free users', () => {
    test('shows Upgrade link', () => {
      const { component } = setup({
        props: {
          currentUser: { role: ['REGISTEREDUSER'] },
          entitlementGroup: [{ slug: 'freeuser' }]
        }
      });
      expect(component.find('Link').children().text()).toBe('UPGRADE');
    });

    test('logs tealium event on link click', () => {
      const event = jest.fn();
      const { component } = setup({
        props: {
          currentUser: { role: ['REGISTEREDUSER'] },
          entitlementGroup: [{ slug: 'freeuser' }],
          tealium: {
            event,
            bodLinkAnalytics: {
              'lnk_pgmdetail_cta-sidebar-getallaccess': 'testLink'
            }
          }
        }
      });

      component.find('Link').simulate('click', { target: 'allAccess' });
      expect(event).toBeCalledWith('testLink', 'allAccess');
    });
  });

  describe('for logged in, megatron, but not free users', () => {
    test('shows Upgrade link', () => {
      const { component } = setup({
        props: {
          currentUser: { role: ['REGISTEREDUSER'] },
          entitlementGroup: [{}]
        }
      });
      expect(component.find('Link').children().text()).toBe('UPGRADE');
    });
  });

  describe('for not logged in free users', () => {
    test('shows AmazonModal', () => {
      const { component } = setup({
        props: {
          entitlementGroup: [{ slug: 'freeuser' }]
        }
      });
      expect(component.find('AmazonModal').exists()).toBe(true);
    });
  });

  test('renders null if profile is still fetching', () => {
    const { component } = setup({
      props: { profileStatus: 'fetching' }
    });
    expect(component.html()).toBe(null);
  });
});
