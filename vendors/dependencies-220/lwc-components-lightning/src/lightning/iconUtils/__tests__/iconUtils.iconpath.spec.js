import { getIconPath } from '../iconUtils';
import cp from 'lightning/configProvider';

// Please note: this test is split apart from thee icon-util.spec.js test file
// because it sets the configuration provider. icon-utils will retrieve the
// getPathPrefix value from the configuration provider and cache it within icon-utils,
// which means once that value is set, it can't be changed. This means that the first
// time any getIconPath() is called without a config provider, it will cache that value.
// By putting the test in a seperate file, we are gauranteed to start with a clean state
// in icon-utils, since each jest test file is run in a clean vm.
describe('getIconPath()', () => {
    it('respects lightning-config-provider overrides', () => {
        cp({
            getPathPrefix: () => '/overridePrefix',
        });
        expect(getIconPath('action:foo')).toBe(
            '/overridePrefix/assets/icons/action-sprite/svg/symbols.svg#foo'
        );
    });

    it('requests the RTL sprites when specified', () => {
        cp({
            getToken: name => `/${name}`,
        });

        expect(getIconPath('action:foo', 'rtl')).toBe(
            '/overridePrefix/lightning.actionSpriteRtl#foo'
        );
        expect(getIconPath('custom:bar', 'rtl')).toBe(
            '/overridePrefix/lightning.customSpriteRtl#bar'
        );
        expect(getIconPath('doctype:baz', 'rtl')).toBe(
            '/overridePrefix/lightning.doctypeSpriteRtl#baz'
        );
        expect(getIconPath('standard:hoge', 'rtl')).toBe(
            '/overridePrefix/lightning.standardSpriteRtl#hoge'
        );
        expect(getIconPath('utility:piyo', 'rtl')).toBe(
            '/overridePrefix/lightning.utilitySpriteRtl#piyo'
        );
    });
});
