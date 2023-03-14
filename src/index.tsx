import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

// let uri: string;
// if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
//     uri = "https://localhost:38559/v2/graphql/";
// } else {
//     uri = "https://bobcatcourses.williamle.com/v2/graphql/";
// }
const uri = "https://bobcatcourses.williamle.com/v2/graphql/";

const client = new ApolloClient({
    uri: uri,
    cache: new InMemoryCache()
});

root.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
