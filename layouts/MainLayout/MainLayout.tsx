import React from "react";
import Header from "../../src/components/common/Header";
import Footer from "../../src/components/common/Footer";

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