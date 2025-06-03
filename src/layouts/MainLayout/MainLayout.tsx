import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";

interface Props {
    children: React.ReactNode;
}   

function MainLayout({ children }: Props) {
    return (
        <div>
            <Header />
            {children}
            <Footer />
        </div>
    );
}

export default MainLayout;