export default [
    {
        id: 'home',
        path: '/',
        component: 'localdevserver/home'
    },
    {
        id: 'preview',
        path: '/preview/:namespace/:name',
        component: 'localdevserver/preview'
    },
    {
        id: 'old-preview',
        path: '/lwc/preview/:namespace/:name',
        component: 'localdevserver/preview'
    },
    {
        id: 'core-list',
        path: '/core',
        component: 'localdevserver/home'
    },
    {
        id: 'corePreview',
        path: '/core/:namespace/:name',
        component: 'localdevserver/corePreview'
    }
];
