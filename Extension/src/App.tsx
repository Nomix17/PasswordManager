import { UserAuthDataProvider } from "./contexts/UserDataContext";
import { Login } from './login'
import { SignIn } from './signIn';
import "./styles/App.css"

function App() {
  return (
    <>
      <UserAuthDataProvider>
        <Login/>
      </UserAuthDataProvider>
    </>
  );
}

export default App
