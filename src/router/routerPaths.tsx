// Copyright (C) 2017-2025 Smart code 203358507

import React from 'react';

export default [
    {
        path: '/intro',
        view: 1,
        element: React.lazy(() => import('../routes/Intro/Intro')),
    },
    {
        path: '/discover/:transportUrl?/:type?/:catalogId?',
        view: 1,
        element: React.lazy(() => import('../routes/Discover/Discover')),
    },
    {
        path: '/library/:type?',
        view: 1,
        element: React.lazy(() => import('../routes/Library/Library')),
    },
    {
        path: '/calendar/:year?/:month?',
        view: 1,
        element: React.lazy(() => import('../routes/Calendar/Calendar')),
    },
    {
        path: '/continuewatching/:type?',
        view: 1,
        element: React.lazy(() => import('../routes/Library/Library')),
    },
    {
        path: '/search',
        view: 1,
        element: React.lazy(() => import('../routes/Search/Search')),
    },
    {
        path: '/live-tv',
        view: 1,
        element: React.lazy(() => import('../components/VidukiPlayer')),
    },
    {
        path: '/metadetails/:type?/:id?/:videoId?',
        view: 2,
        element: React.lazy(() => import('../routes/MetaDetails/MetaDetails')),
    },
    {
        path: '/detail/:type?/:id?/:videoId?',
        view: 2,
        element: React.lazy(() => import('../routes/MetaDetails/MetaDetails')),
    },
    {
        path: '/addons/:type?/:transportUrl?/:catalogId?',
        view: 3,
        element: React.lazy(() => import('../routes/Addons/Addons')),
    },
    {
        path: '/settings',
        view: 3,
        element: React.lazy(() => import('../routes/Settings/Settings')),
    },
    {
        // Legacy stremio player route — now handled by Viduki Player
        path: '/player/:stream/:streamTransportUrl?/:metaTransportUrl?/:type?/:id?/:videoId?',
        view: 4,
        element: React.lazy(() => import('../routes/Player/Player')),
    },
    {
        // Direct Viduki watch route: /watch/:stream/:type/:id/:videoId?
        path: '/watch/:stream/:type?/:id?/:videoId?',
        view: 4,
        element: React.lazy(() => import('../routes/Player/Player')),
    },
    {
        path: '/',
        view: 0,
        element: React.lazy(() => import('../routes/Board/Board')),
    },
    {
        path: '*',
        view: 1,
        element: React.lazy(() => import('../routes/NotFound/NotFound')),
    },
];
