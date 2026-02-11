'use client';

import { useState, FormEvent, useRef } from 'react';
import NoiseBackground from './components/NoiseBackground';

export default function Home() {
  const [username, setUsername] = useState('');
  const [movies, setMovies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [particleSpeed, setParticleSpeed] = useState(1);
  const [particleCount, setParticleCount] = useState(200);
  const [showSettings, setShowSettings] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const startScraping = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setMovies([]);
    setSelectedMovie(null);
    setError('');
    setStatus('Initializing search...');

    let page = 1;
    let keepFetching = true;
    let allMovies: string[] = [];

    try {
      while (keepFetching) {
        setStatus(`Scraping page ${page}...`);

        const res = await fetch(`/api/watchlist?username=${encodeURIComponent(username)}&page=${page}`);
        //
        if (!res.ok) {
          const data = await res.json();
          if (page === 1) throw new Error(data.error || `Failed to fetch watchlist (Status: ${res.status})`);
          break;
        }

        const data = await res.json();

        if (data.error) {
          if (page === 1) throw new Error(data.error);
          break;
        }

        if (data.movies && data.movies.length > 0) {
          allMovies = [...allMovies, ...data.movies];
          setMovies(allMovies); // Update incrementally for visual feedback
          setStatus(`Found ${allMovies.length} movies...`);
          page++;
        } else {
          keepFetching = false;
        }

        if (page > 500) keepFetching = false;
      }
      setStatus(`Successfully scraped ${allMovies.length} movies!`);
      // Scroll to results if successful
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (err: any) {
      setError(err.message || 'An error occurred during scraping.');
      setStatus('Scraping failed.');
    } finally {
      setLoading(false);
    }
  };

  const randomize = () => {
    if (movies.length === 0) return;

    let filteredMovies = movies;
    if (searchQuery) {
      filteredMovies = movies.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filteredMovies.length === 0) return;

    let randomIndex = Math.floor(Math.random() * filteredMovies.length);
    let potentialMovie = filteredMovies[randomIndex];

    if (filteredMovies.length > 1 && potentialMovie === selectedMovie) {
      let attempts = 0;
      while (potentialMovie === selectedMovie && attempts < 10) {
        randomIndex = Math.floor(Math.random() * filteredMovies.length);
        potentialMovie = filteredMovies[randomIndex];
        attempts++;
      }
    }

    setSelectedMovie(potentialMovie);
  };

  const filteredMovies = movies.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 text-white selection:bg-teal-500/30 selection:text-teal-50 relative overflow-hidden font-sans pt-20">
      <NoiseBackground speed={particleSpeed} particleCount={particleCount} />

      {/* Settings Toggle */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-6 right-6 z-50 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-all text-white/50 hover:text-white"
        title="Visual Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
      </button>

      {/* Settings Panel */}
      <div className={`fixed top-20 right-6 w-72 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 z-50 transition-all duration-300 origin-top-right ${showSettings ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <h3 className="text-white/80 font-medium mb-6 flex items-center gap-2">
          <span>Visual Settings</span>
        </h3>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Speed</span>
              <span className="text-teal-400 font-mono">{particleSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={particleSpeed}
              onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-125"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Particles</span>
              <span className="text-teal-400 font-mono">{particleCount}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={particleCount}
              onChange={(e) => setParticleCount(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-125"
            />
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl flex-1 flex flex-col items-center">

        {/* Header */}
        <div className="text-center space-y-4 mb-12 flex-shrink-0">
          <h1 className="text-7xl md:text-9xl font-light tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
            Letterboxd Picker
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-light tracking-wide max-w-md mx-auto">
            Rediscover your watchlist. Randomized.
          </p>
        </div>

        {/* Centered Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-12 pb-20">

          {/* Input Card */}
          <div className="w-full max-w-xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl ring-1 ring-white/5 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-3xl hover:ring-white/10 group">
            <form onSubmit={startScraping} className="flex flex-col gap-6">
              <div className="relative group/input text-center">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Letterboxd Username"
                  disabled={loading}
                  className="w-full text-center bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-xl outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all placeholder:text-white/30 text-white shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !username}
                className="w-full bg-white text-black hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg px-8 py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 whitespace-nowrap"
              >
                {loading ? 'Scanning...' : 'Fetch Movies'}
              </button>
            </form>

            {/* Status & Error */}
            <div className="h-8 mt-6 flex items-center justify-center transition-all duration-300">
              {error ? (
                <p className="text-red-300 bg-red-950/30 px-4 py-1.5 rounded-full text-sm border border-red-500/20 animate-in fade-in">{error}</p>
              ) : status ? (
                <div className="flex flex-col items-center gap-2 w-full max-w-md animate-in fade-in">
                  <p className="text-teal-200/80 text-sm font-medium tracking-wide">{status}</p>
                  {loading && (
                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-full rounded-full w-1/3 animate-indeterminate-bar blur-[1px]"></div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Results Section */}
          {movies.length > 0 && (
            <div ref={resultsRef} className="w-full max-w-4xl space-y-8 animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-4">

              {/* Randomizer Card */}
              <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                {selectedMovie ? (
                  <div className="space-y-6 animate-in zoom-in-50 duration-500">
                    <h2 className="text-teal-400 uppercase tracking-[0.3em] text-xs font-bold">Your Suggestion</h2>
                    <div className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/70 leading-tight drop-shadow-2xl">
                      {selectedMovie}
                    </div>
                  </div>
                ) : (
                  <div className="text-white/30 text-lg font-light">
                    Ready when you are.
                  </div>
                )}

                <div className="mt-12 text-center flex justify-center">
                  <button
                    onClick={randomize}
                    className="group relative inline-flex items-center justify-center px-12 py-5 overflow-hidden font-bold text-white rounded-full transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                    <span className="relative text-xl md:text-2xl mr-2">🎲</span>
                    <span className="relative text-lg font-semibold tracking-wide">Spin the Wheel</span>
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                  </button>
                </div>
              </div>

              {/* List & Search */}
              <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 text-left">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                  <h3 className="text-xl font-medium text-white/90">
                    Watchlist <span className="text-white/40 text-base font-normal ml-1">{filteredMovies.length}</span>
                  </h3>
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search list..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-white/30 transition-colors w-full sm:w-64 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto no-scrollbar pr-2 space-y-1">
                  {filteredMovies.map((movie, idx) => (
                    <div
                      key={idx}
                      className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 cursor-default ${selectedMovie === movie
                        ? 'bg-teal-500/20 text-teal-100 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                        : 'text-white/60 hover:bg-white/5 hover:text-white hover:pl-5'
                        }`}
                    >
                      {movie}
                    </div>
                  ))}
                  {filteredMovies.length === 0 && (
                    <div className="text-white/20 text-center py-12 italic">
                      No movies match your filter
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
