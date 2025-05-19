import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomeCom from './Component/HomeCom';
import ProfileComponent from './Component/ProfileComponent';
import PrivateRoute from './Component/PrivateRoute';
import RegisterComponent from './Component/RegisterComponent';
import LoginComponent from './Component/LoginComponent';
import EditProfile from './Component/EditProfile';
import ChangePasswordComponent from './Component/ChangePassword';
import RegisCarOwner from './Component/RegisCarOwner';
import HomeXeComp from './Component/HomeXeComp';
import ThemXe from './Component/ThemXe';
import ChiTietXe from './Component/ChiTietXe';
import { AuthProvider } from './Authen/AuthContext';
import ChatPopup from './Component/ChatGroup';
import AddCarPage from './Component/AddCarPage';
import BinXe from './Component/BinXe';
import AdminDashboard from './Component/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomeCom />} />
        <Route path="/dang-nhap" element={<LoginComponent />} />
        <Route path="/dang-ky" element={<RegisterComponent/>}/>
        <Route path="/dang-ky-chu-xe" element={<RegisCarOwner/>}/>
        <Route path='/home-xe' element={<HomeXeComp/>}/>
        <Route path='/them-xe' element={<AddCarPage />} />
        <Route path='/chi-tiet-xe/:carId' element={<ChiTietXe />} />
        <Route path='/chat' element={<ChatPopup/>}/>
        <Route path="/thung-rac" element={<BinXe />} />
        <Route path='/admin' element={<AdminDashboard/>}/>


        
        {/* Bọc đường dẫn cần bảo vệ trong PrivateRoute */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<ProfileComponent />} />
          <Route path='/edit-profile' element={<EditProfile/>}/>
          <Route path='/change-password' element={<ChangePasswordComponent/>}/>
        </Route>
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
