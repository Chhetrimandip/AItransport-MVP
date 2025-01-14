import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/home',
      element: <Home />,
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_skipActionErrorRevalidation: true
    }
  }
); 