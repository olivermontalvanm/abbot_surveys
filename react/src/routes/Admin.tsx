import { FC } from "react";
import { Routes, Route } from 'react-router-dom';

import DesktopLayout from "../layouts/DesktopLayout";
import Users from "../pages/Users";

const Orders: FC = ( ) => {
    return (
        <DesktopLayout>
            <Routes>
                <Route path="/users" element={ <Users /> } />
            </Routes>
        </DesktopLayout>
    );
};

export default Orders;
