import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import MainLayout from './layouts/MainLayout';
import SearchBar from './components/SearchBar';
import LoginModal from './components/modals/LoginModal';
import SettingsModal from './components/modals/SettingsModal';
import { useFamily } from './context/FamilyContext';
import ThreadView from './views/ThreadView';
import HealthLabView from './views/HealthLabView';
import SpacesView from './views/SpacesView';
import TelemedicineView from './views/TelemedicineView';
import AnsimFriendsView from './views/AnsimFriendsView';
import AnsimTabletView from './views/AnsimTabletView';
import SafetyView from './views/SafetyView';
import HealthView from './views/HealthView';
import LifeView from './views/LifeView';
import EntertainmentView from './views/EntertainmentView';
import { Newspaper, HelpCircle, Code, Lightbulb, Activity, ShieldCheck, Sun } from 'lucide-react';

/* Ideally move these to a CSS module, but keeping inline for quick restoration of previous state if no module existed for App specific home */
/* Actually, let's use a simple inline style object or class if MainLayout.module.css covers it? */
/* The previous Home View was just content inside MainLayout. */

function App() {
  const [viewState, setViewState] = useState('mainApp'); // Default view
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { currentProfile, loginAs } = useFamily();

  const [activeQuery, setActiveQuery] = useState(null);
  const [shouldFocusInput, setShouldFocusInput] = useState(0); // Trigger for input focus





  const [session, setSession] = useState(null);

  // 0. Auth Listener
  useEffect(() => {
    // Check active session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. URL Routing Logic
  const [threadTab, setThreadTab] = useState('answer'); // Lifted state for Header Tabs

  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/thread/')) {
        const query = decodeURIComponent(path.replace('/thread/', ''));
        if (query) {
          setActiveQuery(query);
          setViewState('mainApp');
          setThreadTab('answer'); // Reset tab on new thread load
        }
      } else if (path === '/' || path === '') {
        setActiveQuery(null);
        setViewState('mainApp');
      }
      // Handle other potential routes if necessary, e.g. /health-lab
      else if (path === '/health-lab') setViewState('healthLab');
      else if (path === '/spaces') setViewState('spaces');
      else if (path === '/telemedicine') setViewState('telemedicine');
      else if (path === '/ansim-friends') setViewState('ansimFriends');
      else if (path === '/ansim-tablet') setViewState('ansimTablet');
    };

    // Initial check
    handleUrlChange();

    // Listen for popstate (back/forward)
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const handleSearch = (query) => {
    console.log('Searching for:', query);

    // VOICE COMMAND INTERCEPTION
    const loginPattern = /안심씨\s+(.+?)(?:이?로)?\s+로그인해줘/;
    const match = query.replace(/\s+/g, ' ').match(loginPattern); // Normalize spaces

    // Also try simple regex
    const simpleLoginPattern = /(.+?)(?:이?로)?\s+로그인/;

    if (query.includes('로그인') && (match || query.match(simpleLoginPattern))) {
      // Extract name
      let targetName = match ? match[1] : query.match(simpleLoginPattern)[1];
      targetName = targetName.trim();

      // Attempt login
      const success = loginAs(targetName);
      if (success) {
        alert(`${targetName}님으로 로그인되었습니다.`);
        setActiveQuery(null);
        setViewState('mainApp');
        return;
      }
    }

    setViewState('mainApp');
    setActiveQuery(query);
    window.history.pushState({}, '', `/thread/${encodeURIComponent(query)}`);
  };

  const handleNewThread = (type) => {
    // Add health, life, safety, learning, game, more to allowed views
    if (['healthLab', 'spaces', 'telemedicine', 'ansimFriends', 'ansimTablet',
      'health', 'life', 'safety', 'learning', 'game', 'more'].includes(type)) {
      setViewState(type);
      setActiveQuery(null);
      // Map type to URL if desired
      const typeToUrl = {
        healthLab: '/health-lab',
        spaces: '/spaces',
        telemedicine: '/telemedicine',
        ansimFriends: '/ansim-friends',
        ansimTablet: '/ansim-tablet',
        health: '/health',
        life: '/life',
        safety: '/safety',
        learning: '/learning',
        game: '/game',
        more: '/more'
      };
      if (typeToUrl[type]) window.history.pushState({}, '', typeToUrl[type]);

    } else {
      setViewState('mainApp');
      setActiveQuery(null);
      setShouldFocusInput(Date.now()); // Trigger focus
      window.history.pushState({}, '', '/');
    }
  }

  const suggestions = [
    { icon: <Activity size={16} />, text: '고혈압 관리 방법 알려줘' },
    { icon: <ShieldCheck size={16} />, text: '우리집 안전 점검 리스트' },
    { icon: <Sun size={16} />, text: '오늘 미세먼지 농도 어때?' },
  ];

  const [showLoginModal, setShowLoginModal] = useState(false);

  // Side Chat Logic
  const [sideChatQuery, setSideChatQuery] = useState(null);

  // Effect: Reset Side Chat on View Navigation if NOT Logged In
  // "Log-in state: Chat persists across screens. Log-out state: One-time answer, refreshes/resets on nav."
  useEffect(() => {
    if (!session) {
      setSideChatQuery(null);
    }
  }, [viewState, session]);

  const handleSideSearch = (query) => {
    setSideChatQuery(query);
    // We don't change viewState, just update side chat
  };

  const SideChatComponent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {sideChatQuery ? (
        <ThreadView
          initialQuery={sideChatQuery}
          onSearch={handleSideSearch}
          activeSection="answer"
          setActiveSection={() => { }} // No-op for now or handle tab
          isSideChat={true} // Add this prop to ThreadView for compact styling if needed
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '1rem' }}>
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            "혈압이 높은 것 같아?"<br />"택배 언제 와?"<br />궁금한 점을 물어보세요.
          </div>
          <SearchBar onSearch={handleSideSearch} placeholder="안심씨에게 질문하기..." />
        </div>
      )}
    </div>
  );

  // 3. Main App (Sidebar + Content)
  return (
    <>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      <MainLayout
        onNewThread={handleNewThread}
        activeView={viewState}
        session={session}
        onLoginClick={() => setShowLoginModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)} // Pass settings handler
        isThreadMode={!!activeQuery} // Pass true if viewing a thread
        onBackClick={() => {
          setActiveQuery(null);
          setViewState('mainApp');
          window.history.pushState({}, '', '/');
        }} // Full Reset to Home
        threadTab={threadTab}
        setThreadTab={setThreadTab}
      >
        {viewState === 'healthLab' ? (
          <HealthLabView />
        ) : viewState === 'spaces' ? (
          <SpacesView
            onBack={() => {
              setViewState('mainApp');
              window.history.pushState({}, '', '/');
            }}
            chatContent={SideChatComponent}
          />
        ) : viewState === 'telemedicine' ? (
          <TelemedicineView
            onBack={() => {
              setViewState('mainApp');
              window.history.pushState({}, '', '/');
            }}
            chatContent={SideChatComponent}
          />
        ) : viewState === 'ansimFriends' ? (
          <AnsimFriendsView />
        ) : viewState === 'ansimTablet' ? (
          <AnsimTabletView />
        ) : viewState === 'safety' ? (
          <SafetyView
            onBack={() => {
              setViewState('mainApp');
              window.history.pushState({}, '', '/');
            }}
            chatContent={SideChatComponent}
          />
        ) : viewState === 'health' ? (
          <HealthView
            onBack={() => {
              setViewState('mainApp');
              window.history.pushState({}, '', '/');
            }}
            chatContent={SideChatComponent}
          />
        ) : viewState === 'life' ? (
          <LifeView
            onBack={() => {
              setViewState('mainApp');
              window.history.pushState({}, '', '/');
            }}
            chatContent={SideChatComponent}
          />
        ) : viewState === 'learning' ? (
          <EntertainmentView
            mode='learning'
            onBack={() => {
              setViewState('mainApp');
              window.history.pushState({}, '', '/');
            }}
            chatContent={SideChatComponent}
          />
        ) : viewState === 'game' ? (
          <EntertainmentView
            mode='game'
            onBack={() => {
              setViewState('mainApp');
              window.history.pushState({}, '', '/');
            }}
            chatContent={SideChatComponent}
          />
        ) : activeQuery ? (
          <ThreadView
            initialQuery={activeQuery}
            onSearch={handleSearch}
            activeSection={threadTab}
            setActiveSection={setThreadTab}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
            padding: '0 1rem',
            paddingBottom: '10vh'
          }}>
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                marginBottom: '0.5rem'
              }}>
                {/* Ansimssi Chatbot Icon (Placeholder: MessageSquarePlus with Gradient) */}
                <div style={{ position: 'relative', width: 24, height: 24 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#22d3ee" />
                        <stop offset="0.5" stopColor="#818cf8" />
                        <stop offset="1" stopColor="#c084fc" />
                      </linearGradient>
                    </defs>
                    {/* MessageSquarePlus Icon Path mimicking Lucide */}
                    <path
                      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      stroke="url(#logoGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 10h6"
                      stroke="url(#logoGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 7v6"
                      stroke="url(#logoGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h1 style={{
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}>
                  {currentProfile ? currentProfile.name : (session?.user?.user_metadata?.full_name || '방문자')}님, 안녕하세요
                </h1>
              </div>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.2
              }}>
                무엇을 도와드릴까요?
              </h2>
            </div>

            <SearchBar
              onSearch={handleSearch}
              placeholder="우리집 AI 주치의 겸 안전돌봄이 안심씨에게 무엇이든 물어보세요."
              shouldFocus={shouldFocusInput}
            />

            <div style={{
              marginTop: '2rem',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '800px'
            }}>
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(item.text)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}>
                  {item.icon}
                  <span>{item.text}</span>
                </button>
              ))}
            </div>


          </div>
        )}
      </MainLayout>
    </>
  );
}

// Force HMR update
export default App;
