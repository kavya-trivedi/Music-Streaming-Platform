import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = ({ setToken }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const urlParams = new URLSearchParams(hash.substring(1));
            const accessToken = urlParams.get('access_token');

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
                setToken(accessToken);
                navigate('/');
            } else {
                navigate('/login');
            }
        }
    }, [navigate, setToken]);

    return <div>Processing authentication...</div>;
};

export default AuthCallback;