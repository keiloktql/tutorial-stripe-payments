import { useState, useEffect, useRef } from 'react';

// This file is for checking if user click outside the component
const useComponentVisible = (isProfilePopUpOpen, setIsProfilePopUpOpen) => {
    const ref = useRef(null);

    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            setIsProfilePopUpOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    });

    return { ref };
}

export default useComponentVisible;