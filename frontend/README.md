# StackOverflow Clone - Frontend

A modern React + Vite frontend for the StackOverflow Clone application.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx      # Main layout wrapper
│   │   ├── Header.jsx      # Navigation header
│   │   └── Sidebar.jsx     # Sidebar navigation
│   ├── cards/
│   │   ├── QuestionCard.jsx
│   │   └── AnswerCard.jsx
│   └── ui/                 # UI components (forms, etc.)
├── pages/
│   ├── Home.jsx
│   ├── Search.jsx
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── questions/
│   │   ├── QuestionsList.jsx
│   │   ├── QuestionDetail.jsx
│   │   └── CreateQuestion.jsx
│   └── profile/
│       └── Profile.jsx
├── services/
│   ├── api.js              # Axios setup with interceptors
│   ├── authService.js
│   ├── questionsService.js
│   ├── answersService.js
│   └── votesService.js
├── store/
│   ├── authStore.js        # Zustand auth store
│   └── questionsStore.js   # Zustand questions store
├── styles/
│   └── (Tailwind CSS)
├── App.jsx                 # Main app component
├── main.jsx                # Entry point
└── index.css               # Global styles

```

## Setup

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your API URL
# VITE_API_URL=http://localhost:8000/api
```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

### Authentication

- User registration
- Login/logout
- JWT token management
- Protected routes
- Auto-logout on 401

### Questions

- Browse all questions
- View trending questions
- Create new questions
- Search questions
- Sort and filter
- Pagination

### Answers

- View answers on questions
- Post new answers
- Accept best answer
- Vote on answers

### Users

- View user profiles
- User reputation
- Activity tracking
- User badges

### Voting

- Upvote/downvote questions
- Upvote/downvote answers
- Vote counts display

## API Integration

All API calls are handled through service files in `src/services/`:

```javascript
// Example: Fetching questions
import { questionsService } from "./services/questionsService";

const questions = await questionsService.getAll((page = 1));
const question = await questionsService.getById(id);
const trending = await questionsService.getTrending();
```

### Error Handling

- Global error handling via Axios interceptors
- Automatic redirect to login on 401
- User-friendly error messages
- Network error handling

## State Management (Zustand)

### Auth Store

```javascript
import { useAuthStore } from "./store/authStore";

const { user, token, logout } = useAuthStore();
```

### Questions Store

```javascript
import { useQuestionsStore } from "./store/questionsStore";

const { questions, currentQuestion, setQuestions } = useQuestionsStore();
```

## Styling

Uses Tailwind CSS with custom component layers:

```css
.btn-primary /* Primary button */
.btn-secondary /* Secondary button */
.btn-outline /* Outline button */
.card /* Card container */
.input-field /* Form input */
```

## Development Workflow

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route to `App.jsx`
3. Create service functions if needed
4. Use Zustand store for state

### Adding a New Component

1. Create component in appropriate `components/` folder
2. Add props interface
3. Handle loading/error states
4. Style with Tailwind CSS

### Adding API Integration

1. Create service functions in `src/services/`
2. Handle errors gracefully
3. Update store if needed
4. Call from component

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code (eslint)

## Environment Variables

```
# .env
VITE_API_URL=http://localhost:8000/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React Router
- Lazy loading of components
- Optimized re-renders with Zustand
- CSS optimized by Tailwind

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## Troubleshooting

### CORS Issues

- Ensure backend URL is correct in `.env`
- Check backend CORS settings

### 404 API Errors

- Verify API_URL matches backend URL
- Check backend routes are working

### State Not Persisting

- Check localStorage is enabled
- Verify Zustand store is properly initialized

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

## License

MIT

---

## Support

For issues or questions, please check:

1. Backend documentation
2. API documentation
3. GitHub issues
4. Project README

Happy coding! 🚀
