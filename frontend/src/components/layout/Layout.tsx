import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-20 sm:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

