import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomeCom from './Component/HomeCom';
import ProfileComponent from './Component/ProfileComponent';
import PrivateRoute from './Component/PrivateRoute';
import RegisterComponent from './Component/RegisterComponent';
import LoginComponent from './Component/LoginComponent';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeCom />} />
        <Route path="/dang-nhap" element={<LoginComponent />} />
        <Route path="/dang-ky" element={<RegisterComponent/>}/>
        
        {/* Bọc đường dẫn cần bảo vệ trong PrivateRoute */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<ProfileComponent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
