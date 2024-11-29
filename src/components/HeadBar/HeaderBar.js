import React, {useState} from 'react';
import { useSelector } from "react-redux";
import './HeaderBar.scss';
import {logoutUser} from "../../redux/action/userAction";
import {Button} from "react-bootstrap"; // SCSS 파일을 연결해 스타일을 분리
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";


const HeaderBar = () => {
    const userInfo = useSelector(state => state.user.account);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        console.log('logoutUser 디스패치 호출');
        dispatch(logoutUser());
        navigate('/');
    };

    return (
        <header className="header-bar">
            {/* 로고 */}
            <div className="header-logo">헬스케어 웹서비스</div>

            {/* 메뉴 링크 */}
            <nav className="header-nav">
                <a href="/MedicalHome" className="header-link">Home</a>
                <a href="/MedicalChart" className="header-link">Charts</a>
                <a href="/MedicalAdd" className="header-link">AddPatient</a>
            </nav>



            {/* 오른쪽 정보 */}
            <div className="header-user-info">
                {userInfo && userInfo.role === "Medical"
                    ? `${userInfo.username}님 (${userInfo.email}) 환영합니다.`
                    : "규혁님(너 이메일) 환영합니다."}
                {/*{userInfo?.email && (*/}
                    <Button variant="outline-danger" onClick={handleLogout} style={{ marginLeft: '20px' }}>
                        Logout
                    </Button>
                {/*)}*/}
            </div>
        </header>
    );
};

export default HeaderBar;
