export const webruntimeConfig: any = {
    rollup: {
        plugins: []
    },
    includeLwcModules: ['force/lds'],
    lwcOptions: {
        exclude: ['/**/*.mjs', /@salesforce\/(?!lwc-dev-server).*/]
    }
};

export const routes = [
    {
        id: 'home',
        name: 'home',
        path: '/',
        isRoot: true,
        view: 'home',
        label: 'Home'
    },
    {
        id: 'preview',
        name: 'preview',
        path: '/lwc/preview/:cmp*',
        isRoot: false,
        view: 'preview',
        label: 'LWC Preview'
    }
];

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
    mainLayout: {
        name: 'mainLayout',
        label: 'Default Layout',
        component: {
            name: 'localdevserver/layout',
            regions: [
                {
                    name: 'header',
                    label: 'Header',
                    components: [
                        {
                            name: 'localdevserver/header'
                        }
                    ]
                },
                {
                    name: 'footer',
                    label: 'Footer',
                    components: []
                }
            ]
        }
    },
    home: {
        name: 'home',
        label: 'Home',
        themeLayoutType: 'main',
        component: {
            name: 'localdevserver/home',
            regions: []
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
            },
            regions: []
        }
    }
};
