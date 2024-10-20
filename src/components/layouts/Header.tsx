import Logo from '@/assets/images/InspireAI.svg';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '@/api/userAuth';
import React, { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { userInfoAtom } from '@/atoms/userAuthAtoms';
import useUserAuth from '@/hooks/useUserAuth';
import { RoutePaths } from '@/routes/RoutePaths';
import { resetCanvasAtom } from '@/atoms/studioAtoms';

const Header = () => {
  const navigate = useNavigate();

  const [isMyinfoOpen, setIsMyinfoOpen] = useState(false);
  const [isArchiveMenuOpen, setIsArchiveMenuOpen] = useState(false);

  const myInfoRef = useRef<HTMLUListElement | null>(null);
  const subMenuRef = useRef<HTMLUListElement | null>(null);
  const infoButtonRef = useRef<HTMLDivElement | null>(null);
  const archiveMenuButtonRef = useRef<HTMLLIElement | null>(null);

  const userInfo = useAtomValue(userInfoAtom);
  const userAuth = useUserAuth();
  const [, reset] = useAtom(resetCanvasAtom);

  const clickMyinfo = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMyinfoOpen((prev) => !prev);
  };

  const clickArchiveMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsArchiveMenuOpen((prev) => !prev);
  };
  const clickSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMyinfoOpen(false);
    userAuth.logout();

    reset(); // 유저가 직접 로그아웃 했을 때는 스튜디오를 모두 초기화
    logout();
    // 홈으로 이동
    navigate(RoutePaths.Home);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (infoButtonRef.current && infoButtonRef.current.contains(target)) {
        return;
      }
      if (archiveMenuButtonRef.current && archiveMenuButtonRef.current.contains(target)) {
        return;
      }

      if (myInfoRef.current && !myInfoRef.current.contains(target)) {
        setIsMyinfoOpen(false);
      }

      if (subMenuRef.current && !subMenuRef.current.contains(target)) {
        setIsArchiveMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <h1>
        <Link to={RoutePaths.Home}>
          <img src={Logo} />
        </Link>
      </h1>
      <div className="cont">
        <div className="menu">
          <ul>
            <li>
              <Link to={RoutePaths.Studio}>Studio</Link>
            </li>
            <li className="depth" ref={archiveMenuButtonRef} onClick={clickArchiveMenu}>
              Archive
              {isArchiveMenuOpen ? (
                <ul ref={subMenuRef}>
                  <li>
                    <Link to={RoutePaths.Library}>Library</Link>
                  </li>
                  <li>
                    <Link to={RoutePaths.Draft}>Draft</Link>
                  </li>
                </ul>
              ) : null}
            </li>
          </ul>
        </div>
        <div className={`myinfo ${isMyinfoOpen ? 'open' : ''}`}>
          {userInfo ? (
            <div className="name" ref={infoButtonRef} onClick={clickMyinfo}>
              <span>{userInfo?.email.substring(0, 1).toUpperCase() || ''}</span>
              {userInfo?.username}
            </div>
          ) : (
            <div className="signin">
              <Link to={RoutePaths.Login}>Sign in</Link>
            </div>
          )}

          {isMyinfoOpen ? (
            <ul className="mymenu" ref={myInfoRef}>
              <li>{userInfo?.email}</li>
              <li className="signout">
                <a href="/" onClick={clickSignOut}>
                  Sign out
                </a>
              </li>
            </ul>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
