import React, { createContext, useContext, useState, useEffect } from 'react';

const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
    // Default family members
    const [familyMembers, setFamilyMembers] = useState(() => {
        const saved = localStorage.getItem('ansim-family-members');
        return saved ? JSON.parse(saved) : [];
    });

    // Current Active Profile (null = Visitor/Default, or one of the family members)
    const [currentProfile, setCurrentProfile] = useState(() => {
        const saved = localStorage.getItem('ansim-current-profile');
        return saved ? JSON.parse(saved) : null;
    });

    // Contacts (Ansim Speed Dial)
    const [contacts, setContacts] = useState(() => {
        const saved = localStorage.getItem('ansim-contacts');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('ansim-family-members', JSON.stringify(familyMembers));
    }, [familyMembers]);

    useEffect(() => {
        localStorage.setItem('ansim-contacts', JSON.stringify(contacts));
    }, [contacts]);

    useEffect(() => {
        if (currentProfile) {
            localStorage.setItem('ansim-current-profile', JSON.stringify(currentProfile));
        } else {
            localStorage.removeItem('ansim-current-profile');
        }
    }, [currentProfile]);

    const addFamilyMember = (name, role) => {
        const newMember = { id: Date.now(), name, role };
        setFamilyMembers([...familyMembers, newMember]);
    };

    const removeFamilyMember = (id) => {
        setFamilyMembers(familyMembers.filter(m => m.id !== id));
        if (currentProfile && currentProfile.id === id) {
            setCurrentProfile(null); // Logout if removed
        }
    };

    const addContact = (name, number) => {
        const newContact = { id: Date.now(), name, number };
        setContacts([...contacts, newContact]);
    };

    const removeContact = (id) => {
        setContacts(contacts.filter(c => c.id !== id));
    };

    const loginAs = (name) => {
        const member = familyMembers.find(m => m.name === name);
        if (member) {
            setCurrentProfile(member);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentProfile(null);
    };

    return (
        <FamilyContext.Provider value={{
            familyMembers,
            currentProfile,
            contacts,
            addFamilyMember,
            removeFamilyMember,
            addContact,
            removeContact,
            loginAs,
            logout
        }}>
            {children}
        </FamilyContext.Provider>
    );
};

export const useFamily = () => {
    const context = useContext(FamilyContext);
    if (!context) {
        throw new Error('useFamily must be used within a FamilyProvider');
    }
    return context;
};
