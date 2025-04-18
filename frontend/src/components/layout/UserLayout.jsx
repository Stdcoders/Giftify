import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { Outlet } from 'react-router-dom';
const UserLayout = () => {
  return (
    <div>
      {/*Header*/}
      <Header/>
      {/*Main Content*/}
      <main>
        <Outlet/>
      </main>
      {/*Footer*/}
      <Footer/>
    </div>
  )
};

export default UserLayout;
