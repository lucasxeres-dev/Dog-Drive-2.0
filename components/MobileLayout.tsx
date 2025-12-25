import React from 'react';
import { Outlet } from 'react-router-dom';

const MobileLayout: React.FC = () => {
    return (
        <div className="max-w-md mx-auto h-screen relative bg-white dark:bg-background-dark overflow-hidden flex flex-col shadow-2xl">
            <Outlet />
        </div>
    );
};

export default MobileLayout;
