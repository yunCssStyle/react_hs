import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { GlobalContextProvider } from './context/GlobalContext.tsx';
import { ThemeProvider } from 'styled-components';
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GlobalContextProvider>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </GlobalContextProvider>,
);
