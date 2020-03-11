import { createElement } from 'lwc';
import ComponentsPanel from 'localdevserver/componentsPanel';
import { flushPromises } from '../../../__tests__/testutils';

jest.useFakeTimers();

function createComponentUnderTest(props) {
    const el = createElement('localdevserver-components-panel', {
        is: ComponentsPanel
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
}

function createProjectMetadata() {
    return {
        project: {
            projectName: 'test-project',
            packages: [
                {
                    packageName: 'Test Package',
                    isDefault: true,
                    key: 'package1',
                    components: [
                        {
                            namespace: 'c',
                            name: 'foo',
                            jsName: 'c/foo',
                            htmlName: 'c-foo',
                            url: 'test/c/foo',
                            path: '/Users/arya/dev/test/src/foo/foo.js'
                        },
                        {
                            namespace: 'c',
                            name: 'fooBar',
                            jsName: 'c/fooBar',
                            htmlName: 'c-foo-bar',
                            url: 'test/c/fooBar',
                            path: '/Users/arya/dev/test/src/fooBar/fooBar.js'
                        },
                        {
                            namespace: 'c',
                            name: 'fooBaz',
                            jsName: 'c/fooBaz',
                            htmlName: 'c-foo-baz',
                            url: 'test/c/fooBaz',
                            path: '/Users/arya/dev/test/src/foo/fooBaz.js'
                        }
                    ]
                }
            ]
        }
    };
}

function getComponentList(element) {
    return element.shadowRoot.querySelector('.components-list');
}

function getComponentListItems(element) {
    return getComponentList(element).querySelectorAll('.list-item');
}

function getSearchInput(element) {
    return element.shadowRoot.querySelector('.search input');
}

function getIllustrationContainer(element) {
    return element.shadowRoot.querySelector('.slds-illustration');
}

async function setSearchInputValue(element, value) {
    const input = getSearchInput(element);
    input.value = value;
    input.dispatchEvent(new Event('change'));
    await flushPromises();
}

async function clickClearSearchButton(element) {
    const clearButton = element.shadowRoot.querySelector(
        '.search button[title="Clear"]'
    );
    clearButton.click();
    await flushPromises();
}

describe('localdevserver-components-panel', () => {
    it('renders', async () => {
        global.LocalDev = createProjectMetadata();
        const element = createComponentUnderTest();
        await flushPromises();

        expect(element).toMatchSnapshot();
    });

    it('filters with search', async () => {
        global.LocalDev = createProjectMetadata();
        const element = createComponentUnderTest();
        await flushPromises();

        let listItems = getComponentListItems(element);
        expect(listItems.length).toBe(3);

        await setSearchInputValue(element, 'foo-bar');

        listItems = getComponentListItems(element);
        expect(listItems.length).toBe(1);
        expect(listItems[0].textContent).toBe('c-foo-bar');
    });

    it('search matches without the hyphen', async () => {
        global.LocalDev = createProjectMetadata();
        const element = createComponentUnderTest();
        await flushPromises();

        let listItems = getComponentListItems(element);
        expect(listItems.length).toBe(3);

        await setSearchInputValue(element, 'foobar');

        listItems = getComponentListItems(element);
        expect(listItems.length).toBe(1);
        expect(listItems[0].textContent).toBe('c-foo-bar');
    });

    it('search matches when including namespace', async () => {
        global.LocalDev = createProjectMetadata();
        const element = createComponentUnderTest();
        await flushPromises();

        let listItems = getComponentListItems(element);
        expect(listItems.length).toBe(3);

        await setSearchInputValue(element, 'c-foo-bar');

        listItems = getComponentListItems(element);
        expect(listItems.length).toBe(1);
        expect(listItems[0].textContent).toBe('c-foo-bar');
    });

    it('search matches case insensitive', async () => {
        global.LocalDev = createProjectMetadata();
        const element = createComponentUnderTest();
        await flushPromises();

        let listItems = getComponentListItems(element);
        expect(listItems.length).toBe(3);

        await setSearchInputValue(element, 'FOOBAR');

        listItems = getComponentListItems(element);
        expect(listItems.length).toBe(1);
        expect(listItems[0].textContent).toBe('c-foo-bar');
    });

    it('search matches multiple results', async () => {
        global.LocalDev = createProjectMetadata();
        const element = createComponentUnderTest();
        await flushPromises();

        let listItems = getComponentListItems(element);
        expect(listItems.length).toBe(3);

        await setSearchInputValue(element, 'foo-b');

        listItems = getComponentListItems(element);
        expect(listItems.length).toBe(2);
        expect(listItems[0].textContent).toBe('c-foo-bar');
        expect(listItems[1].textContent).toBe('c-foo-baz');
    });

    it('clears search', async () => {
        global.LocalDev = createProjectMetadata();
        const element = createComponentUnderTest();
        await flushPromises();

        let listItems = getComponentListItems(element);
        expect(listItems.length).toBe(3);

        await setSearchInputValue(element, 'foo-bar');

        listItems = getComponentListItems(element);
        expect(listItems.length).toBe(1);

        await clickClearSearchButton(element);

        listItems = getComponentListItems(element);
        expect(listItems.length).toBe(3);

        const input = getSearchInput(element);
        expect(input.value).toBe('');
    });

    it('render an illustration and message when no components match search', async () => {
        global.LocalDev = createProjectMetadata();
        const element = createComponentUnderTest();
        await flushPromises();

        let listItems = getComponentListItems(element);
        expect(listItems.length).toBe(3);

        await setSearchInputValue(element, 'xxx');

        const illustration = getIllustrationContainer(element);
        expect(illustration).toMatchSnapshot();
    });

    it('render an illustration and message no components are in the package', async () => {
        const metadata = createProjectMetadata();
        metadata.project.packages[0].components = [];
        global.LocalDev = metadata;

        const element = createComponentUnderTest();
        await flushPromises();

        const illustration = getIllustrationContainer(element);
        expect(illustration).toMatchSnapshot();
    });
});
