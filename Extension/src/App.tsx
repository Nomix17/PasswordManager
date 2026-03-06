import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { UserAuthDataProvider } from "./contexts/UserDataContext";
import { PasswordEntriesProvider } from "./contexts/PasswordsEntriesContext";
import { Login } from './Login'
import { SignUp } from './SignUp';
import { Home } from './Home';

import "./styles/App.css"

function App() {
  return (
    <UserAuthDataProvider>
        <PasswordEntriesProvider>
        <BrowserRouter>

          <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/sign_up" element={<SignUp/>}/>
            <Route path="/home" element={<Home/>}/>
          </Routes>

        </BrowserRouter>
      </PasswordEntriesProvider>
    </UserAuthDataProvider>
  );
}

export default App
