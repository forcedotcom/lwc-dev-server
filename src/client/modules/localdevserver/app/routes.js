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
    }
];
