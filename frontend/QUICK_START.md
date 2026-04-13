# Frontend Quick Start Guide

## Project Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This installs:

- React 18
- Vite (dev server & build tool)
- React Router (routing)
- Axios (HTTP client)
- Zustand (state management)
- Tailwind CSS (styling)

### 2. Start Development Server

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

### 3. Access the Application

```
Home Page:        http://localhost:5173/
Questions:        http://localhost:5173/questions
Login:            http://localhost:5173/auth/login
Register:         http://localhost:5173/auth/register
```

## Project Structure

### Pages

- **Home** - Landing page with trending questions
- **Questions List** - Browse all questions with pagination
- **Question Detail** - View and answer specific questions
- **Create Question** - Ask a new question
- **Login/Register** - Authentication
- **Profile** - User profile with stats
- **Search** - Search questions

### Components

- **Layout** - Main layout with header and sidebar
- **Header** - Navigation with search and auth
- **Sidebar** - Navigation menu
- **QuestionCard** - Question listing component
- **AnswerCard** - Answer component with voting

### Services

- **api.js** - Axios setup with auth interceptors
- **authService.js** - Login, register, profile
- **questionsService.js** - Question CRUD operations
- **answersService.js** - Answer CRUD operations
- **votesService.js** - Voting functionality

### State Management (Zustand)

- **authStore** - User authentication state
- **questionsStore** - Questions and answers state

## Key Features Implemented

✅ User registration and login
✅ JWT authentication with auto-refresh
✅ Browse questions with pagination
✅ Create new questions
✅ Post and view answers
✅ Vote on questions and answers
✅ Search functionality
✅ User profiles
✅ Responsive design
✅ Error handling
✅ Loading states

## How It Works

### Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token added to API requests via Axios interceptor
5. Auto-logout on 401 error

### Question Browsing

1. Fetch questions from `/api/questions/`
2. Display with pagination
3. Click to view details
4. View answers and post new answer
5. Vote on questions/answers

### API Integration

All API calls handled through service layer:

```javascript
// Services automatically add JWT token
import { questionsService } from "./services/questionsService";

// Fetch questions
const data = await questionsService.getAll(page);

// Create question
const newQ = await questionsService.create({
  title: "Question",
  content: "Details",
  tags: ["tag1", "tag2"],
});

// Vote on question
import { votesService } from "./services/votesService";
await votesService.vote(questionId, "question", "upvote");
```

## Environment Configuration

Create `.env` file:

```
VITE_API_URL=http://localhost:8000/api
```

The Vite build tool automatically loads this configuration.

## Running in Production

### Build

```bash
npm run build
```

Creates optimized production build in `dist/` folder.

### Preview Build

```bash
npm run preview
```

Test production build locally before deploying.

### Docker Deployment

```bash
docker build -t stackoverflow-frontend .
docker run -p 3000:3000 stackoverflow-frontend
```

## Common Development Tasks

### Add New Page

1. Create file in `src/pages/`
2. Import in `App.jsx`
3. Add route

```javascript
<Route path="/newpage" element={<NewPage />} />
```

### Add New API Call

1. Create function in `src/services/`
2. Use in component with error handling

```javascript
const myService = {
  getData: async () => {
    const response = await apiClient.get("/endpoint/");
    return response.data;
  },
};
```

### Add Global State

1. Create store in `src/store/`
2. Use in components

```javascript
import { create } from "zustand";

export const useMyStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

## Debugging Tips

### Check Network Requests

- Open DevTools (F12)
- Go to Network tab
- Check request/response details

### Check Local Storage

- DevTools → Application → Local Storage
- View stored JWT token and user data

### Check Console Errors

- DevTools → Console
- Look for JavaScript errors

### API Issues

- Ensure backend is running on localhost:8000
- Check `.env` file has correct VITE_API_URL
- Verify CORS settings in backend

## Performance

- **Code Splitting** - Routes are automatically code-split by Vite
- **Lazy Loading** - Components loaded on demand
- **Optimized Builds** - Production build is minified and optimized
- **Caching** - Service workers for offline support (optional)

## Testing

Create test files alongside components:

```
src/components/MyComponent.jsx
src/components/MyComponent.test.jsx
```

Run tests:

```bash
npm run test
```

## Deployment Options

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload 'dist' folder to Netlify
```

### Docker/Server

- Build: `npm run build`
- Serve: Use nginx or Node server
- Set backend URL in `.env`

## Troubleshooting

| Issue                     | Solution                                      |
| ------------------------- | --------------------------------------------- |
| 404 errors                | Check backend is running, routes exist        |
| CORS errors               | Verify backend CORS settings                  |
| Login fails               | Check email/password, verify backend endpoint |
| Questions not loading     | Check backend API response format             |
| Styling not applied       | Clear cache, rebuild with `npm run build`     |
| Theme changes not showing | Hard refresh (Ctrl+Shift+R)                   |

## Next Steps

1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Try creating account and posting questions
4. Test API integration with backend
5. Build: `npm run build`
6. Deploy to Vercel/Netlify/Docker

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Backend must be running for frontend to work!**

Make sure backend is running on `http://localhost:8000` before starting frontend development.
