# Directory Layout of Frontend

src
├── _mock
│   └── data files for demo/mock up
├── components
│   └── reusable components like charts, logos, icons
├── hooks
│   └── general media and effect functions for webpage
├── layouts
│   ├── contains general overlying dashboard implementation
│   └── navigation and header implementation
├── pages
│   └── declares metadata and initializes section component per page
├── routes
│   └── declares routing for each page based on link pathname
├── sections
│   ├── specific page design and implementation
│   ├── contains view of the component rendered inside its page
│   └── contains related components for view
├── theme
│   └── global color palettes, themes, and site aesthetic
├── utils
│   └── time and number formatting
└── main.jsx 