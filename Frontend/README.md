# Frontend Documentation

## Directory Structure
The Frontend is split into several subdirectories. Below is a tree structure detailing each subdirectory and its general purpose:

src\
├── components\
├── hooks\
├── layouts\
├── pages\
├── routes\
├── sections\
├── theme\
├── utils\
└── main.jsx 

### Components
The components directory contains any reusable components such as charts, logos, icons, and other optional components needed to render across all pages in the dashboard.

### Hooks
The hooks directory contains a couple general media and effect functions for the webpage such as making a page responsive or scrolling to top.

### Layouts
The layouts directory contains general overlying dashboard implementation. If any configurations for the dashboard, navigation bar, or header bar is needed, this is where to develop.

### Pages
The pages directory contains files where metadata and initialization of each section component are. Each pages component also calls an API that verifies a users token to prevent unauthorized access to anyone information.

### Routes
The routes directory declares the routing for each page based on the link's pathname. The structure for the pathname  for the dashboard follows:

```
URL/dashboard/role/userID/page
```

To extract any information for routing, the usePathname hook is utilized in the routes/hooks directory. To change the route at will, the useRouter hook is utilized in the routes/hooks directory as well.

### Sections
The directory contains the specific page design and implementation. It contains the view of each page component rendered inside. As well, other related child components are located here.

### Theme
The theme directory contains the global color palettes, themes, and site aesthetics.

### Utils
The utils directory contains any time or number formatting helper functions.