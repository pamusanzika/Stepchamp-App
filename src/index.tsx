import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { GoogleConfig, MSALConfig } from './configs/authConfig';
import { store } from './redux/store'
import { Provider } from 'react-redux'


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const msalInstance = new PublicClientApplication(MSALConfig);
const googleInstanceClientId = GoogleConfig.clientId;

root.render(
  <React.StrictMode>
  <BrowserRouter basename={'/'}>
      <GoogleOAuthProvider clientId={googleInstanceClientId}>
          <MsalProvider instance={msalInstance}>
          <Provider store={store}>
              <App/>
          </Provider>
          </MsalProvider>
      </GoogleOAuthProvider>
  </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
