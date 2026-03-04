import { UserAuthDataProvider } from "./contexts/UserDataContext";
import { Login } from './login'
import { SignUp } from './SignUp';
import "./styles/App.css"

function App() {
  return (
    <>
      <UserAuthDataProvider>
        <SignUp/>
        <Login/>
      </UserAuthDataProvider>
    </>
  );
}

export default App
