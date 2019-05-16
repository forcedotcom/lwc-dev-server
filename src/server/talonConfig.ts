export const talonConfig = {
    includeLwcModules: ['force/lds', 'force/salesforceScopedModuleResolver']
};

export const routes = [
    {
        name: 'home',
        path: '/',
        isRoot: true,
        view: 'home',
        label: 'Home'
    },
    {
        name: 'preview',
        path: '/lwc/preview/:cmp*',
        isRoot: false,
        view: 'preview',
        label: 'LWC Preview'
    }
];

export const labels = {};

export const theme = {
    name: 'duck',
    label: 'Duck Burrito',
    themeLayouts: {
        main: {
            view: 'mainLayout'
        }
    }
};

export const views = {
    home: {
        name: 'home',
        label: 'Home',
        themeLayoutType: 'main',
        component: {
            name: 'localdevserver/home',
            regions: []
        }
    },
    mainLayout: {
        name: 'mainLayout',
        label: 'Default Layout',
        component: {
            name: 'localdevserver/layout',
            regions: [
                {
                    name: 'header',
                    label: 'Header',
                    components: []
                },
                {
                    name: 'footer',
                    label: 'Footer',
                    components: []
                }
            ]
        }
    },
    preview: {
        name: 'preview',
        label: 'LWC Preview',
        themeLayoutType: 'main',
        component: {
            name: 'localdevserver/preview',
            attributes: {
                cmp: '{!cmp}'
            }
        }
    }
};
