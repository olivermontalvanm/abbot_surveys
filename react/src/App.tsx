import { BrowserRouter as Router } from 'react-router-dom';
import './styles/App.css'
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./styles/mui-theme";
import { Provider } from 'react-redux';
import store from './store/store';

import AppRoutes from './routes/Index';

const App = ( ) => {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <Router>
                    <AppRoutes />
                </Router>
            </ThemeProvider>
        </Provider>
    )
}

// ts-prune-ignore-next
export default App;
