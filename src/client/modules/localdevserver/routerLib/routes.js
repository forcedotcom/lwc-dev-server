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
    }
];
