import * as lib from '../routerLib';
import { generateUrl } from 'webruntime_navigation/navigation';

jest.mock('webruntime_navigation/navigation', () => ({
    generateUrl: jest.fn(() => Promise.resolve('/mock/url'))
}));

describe('routerLib.js', () => {
    describe('getHomeUrl', () => {
        it('calls generateUrl with the correct id', () => {
            const fakeContext = {};
            lib.getHomeUrl(fakeContext);

            expect(generateUrl).toBeCalledWith(
                fakeContext,
                expect.objectContaining({
                    id: 'home'
                })
            );
        });
    });

    describe('getPreviewUrl', () => {
        it('calls generateUrl with the namespace and name attributes', () => {
            const fakeContext = {};
            lib.getPreviewUrl(fakeContext, 'c', 'foo');

            expect(generateUrl).toBeCalledWith(
                fakeContext,
                expect.objectContaining({
                    attributes: {
                        namespace: 'c',
                        name: 'foo'
                    }
                })
            );
        });
    });
});
