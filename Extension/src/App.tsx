import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { UserAuthDataProvider } from "./contexts/UserDataContext";
import { PasswordEntriesProvider } from "./contexts/PasswordsEntriesContext";
import { Login } from './Login'
import { SignUp } from './SignUp';
import { Home } from './Home';
import "./styles/basicStyles.css";
import "./styles/App.css"

function App() {
  return (
    <UserAuthDataProvider>
        <PasswordEntriesProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/home"/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/sign_up" element={<SignUp/>}/>
            <Route path="/home" element={<Home/>}/>
          </Routes>
        </HashRouter>
      </PasswordEntriesProvider>
    </UserAuthDataProvider>
  );
}

export default App
