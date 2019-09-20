import { createElement } from 'lwc';
import Preview from 'localdevserver/preview';
import { createElement as talonCreateElement } from 'talon/componentService';

// this is indirectly imported by talon framework stuff, and needs to be mocked!
jest.mock('@talon/connect-gen/dist/forceChatterApi/util/util', () => ({}), {
    virtual: true
});

jest.mock('talon/componentService', () => ({
    createElement: jest.fn()
}));

async function waitForRender() {
    return new Promise(resolve => {
        process.nextTick(resolve);
    });
}

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-preview', { is: Preview });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

describe('preview', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('renders', async () => {
        const componentElement = createComponentUnderTest();
        expect(componentElement).toMatchSnapshot();
    });

    it('renders a component', async () => {
        talonCreateElement.mockImplementation(() => {
            const el = document.createElement('div');
            el.appendChild(document.createTextNode('test element'));
            return Promise.resolve(el);
        });

        global.LocalDev = {
            project: {
                projectName: 'test-project',
                packages: [
                    {
                        packageName: 'Test Package',
                        isDefault: true,
                        components: [
                            {
                                jsName: 'c/foo',
                                htmlName: 'c-foo'
                            }
                        ]
                    }
                ]
            }
        };

        const componentElement = createComponentUnderTest({
            cmp: 'c/foo'
        });

        await waitForRender();
        expect(componentElement).toMatchSnapshot();
    });

    it('displays errors', async () => {
        talonCreateElement.mockImplementation(() => {
            const el = document.createElement('div');
            el.appendChild(document.createTextNode('test element'));
            return Promise.reject('test error');
        });

        global.LocalDev = {
            project: {
                projectName: 'test-project',
                packages: [
                    {
                        packageName: 'Test Package',
                        isDefault: true,
                        components: [
                            {
                                jsName: 'c/foo',
                                htmlName: 'c-foo'
                            }
                        ]
                    }
                ]
            }
        };

        const componentElement = createComponentUnderTest({
            cmp: 'c/foo'
        });

        await waitForRender();
        expect(componentElement).toMatchSnapshot();
    });
});
