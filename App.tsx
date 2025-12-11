import React, { useState, useEffect } from 'react';
import { WeatherType, WeatherData, Language } from './types';
import { WeatherAnimation } from './components/WeatherAnimations';
import { generateWeatherDescription, fetchCityWeather } from './services/geminiService';

// Default cities to show if empty
const DEFAULT_CITIES: WeatherData[] = [
  { id: '1', city: 'Beijing', type: WeatherType.SUNNY, temp: 28, high: 31, low: 22, label: '晴朗' },
  { id: '2', city: 'London', type: WeatherType.RAINY, temp: 15, high: 18, low: 12, label: '小雨' },
];

const App: React.FC = () => {
  // State
  const [language, setLanguage] = useState<Language>('zh');
  const [pinnedCities, setPinnedCities] = useState<WeatherData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<WeatherData | null>(null);
  const [activeWeather, setActiveWeather] = useState<WeatherData | null>(null);
  const [aiDescription, setAiDescription] = useState<string>('');
  const [loadingDesc, setLoadingDesc] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('atmosphere_pinned_cities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
            setPinnedCities(parsed);
            setActiveWeather(parsed[0]);
        } else {
            setPinnedCities(DEFAULT_CITIES);
            setActiveWeather(DEFAULT_CITIES[0]);
        }
      } catch (e) {
        setPinnedCities(DEFAULT_CITIES);
        setActiveWeather(DEFAULT_CITIES[0]);
      }
    } else {
      setPinnedCities(DEFAULT_CITIES);
      setActiveWeather(DEFAULT_CITIES[0]);
    }
  }, []);

  // Update AI Description when active weather changes
  useEffect(() => {
    if (!activeWeather) return;

    let isMounted = true;
    const fetchDescription = async () => {
      setLoadingDesc(true);
      const desc = await generateWeatherDescription(activeWeather.type, activeWeather.city, language);
      if (isMounted) {
        setAiDescription(desc);
        setLoadingDesc(false);
      }
    };

    fetchDescription();
    return () => { isMounted = false; };
  }, [activeWeather, language]);

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResult(null);
    
    // Call Gemini to get simulated weather
    const result = await fetchCityWeather(searchQuery, language);
    if (result) {
        setSearchResult(result);
        setActiveWeather(result); // Preview it immediately
    }
    setSearching(false);
  };

  // Handle Pin
  const handlePin = () => {
    if (!searchResult) return;
    
    // Check if already pinned
    if (pinnedCities.some(c => c.city.toLowerCase() === searchResult.city.toLowerCase())) {
        return;
    }

    const newPinned = [...pinnedCities, searchResult];
    setPinnedCities(newPinned);
    localStorage.setItem('atmosphere_pinned_cities', JSON.stringify(newPinned));
    setSearchResult(null); // Clear search result after pinning
    setSearchQuery('');
  };

  // Handle Delete
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newPinned = pinnedCities.filter(c => c.id !== id);
    setPinnedCities(newPinned);
    localStorage.setItem('atmosphere_pinned_cities', JSON.stringify(newPinned));
    
    if (activeWeather?.id === id && newPinned.length > 0) {
        setActiveWeather(newPinned[0]);
    } else if (newPinned.length === 0) {
        setActiveWeather(null);
        setAiDescription('');
    }
  };

  // Translations
  const t = {
    searchPlaceholder: language === 'zh' ? '搜索城市...' : 'Search City...',
    weatherTitle: language === 'zh' ? '天气' : 'Weather',
    design: language === 'zh' ? '加利福尼亚设计' : 'DESIGNED IN CALIFORNIA',
    pin: language === 'zh' ? '添加' : 'Pin',
    searching: language === 'zh' ? '搜索中...' : 'Searching...',
    noResult: language === 'zh' ? '未找到' : 'No Result',
    high: language === 'zh' ? '高' : 'H',
    low: language === 'zh' ? '低' : 'L',
    enFont: language === 'en' ? 'text-sm font-light tracking-widest' : '',
  };

  // Get current date string
  const dateString = new Date().toLocaleDateString(
      language === 'zh' ? 'zh-CN' : 'en-US', 
      { weekday: 'long', month: 'long', day: 'numeric' }
  );

  return (
    <div className={`min-h-screen bg-black text-white p-6 md:p-12 relative overflow-x-hidden ${language === 'en' ? 'font-light' : ''}`}>
      {/* Background Ambient Gradient */}
      <div 
        className={`fixed inset-0 transition-colors duration-1000 ease-in-out z-0 pointer-events-none opacity-30
          ${activeWeather?.type === WeatherType.SUNNY ? 'bg-gradient-to-br from-orange-900 via-black to-black' : ''}
          ${activeWeather?.type === WeatherType.RAINY ? 'bg-gradient-to-br from-blue-900 via-black to-black' : ''}
          ${activeWeather?.type === WeatherType.SNOWY ? 'bg-gradient-to-br from-slate-800 via-black to-black' : ''}
          ${activeWeather?.type === WeatherType.WINDY ? 'bg-gradient-to-br from-gray-800 via-black to-black' : ''}
          ${!activeWeather ? 'bg-black' : ''}
        `}
      />

      <main className="relative z-10 max-w-6xl mx-auto flex flex-col gap-10">
        {/* Top Bar: Title & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-4xl font-light tracking-tight text-white/90">{t.weatherTitle}</h1>
                <p className={`text-white/50 text-sm font-medium uppercase tracking-widest ${language === 'en' ? 'text-xs' : ''}`}>
                    {dateString}
                </p>
            </header>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <form onSubmit={handleSearch} className="relative group w-full md:w-80">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full bg-white/10 border border-white/10 rounded-full px-5 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:bg-white/20 focus:ring-1 focus:ring-white/30 transition-all backdrop-blur-md"
                    />
                    {searching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                    )}
                </form>
                
                <button 
                    onClick={() => setLanguage(prev => prev === 'zh' ? 'en' : 'zh')}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-medium hover:bg-white/10 transition-colors"
                >
                    {language === 'zh' ? 'EN' : '中'}
                </button>
            </div>
        </div>

        {/* Dynamic Description Area */}
        <section className="min-h-[60px] flex items-center justify-start">
            {loadingDesc ? (
                <div className="flex gap-1 pl-1">
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            ) : (
                <p className={`text-xl md:text-2xl font-light text-white/90 leading-relaxed max-w-3xl animate-pulse-glow ${language === 'en' ? 'text-lg italic font-thin tracking-wide' : ''}`}>
                   {aiDescription}
                </p>
            )}
        </section>

        {/* Search Result Preview (If any) */}
        {searchResult && (
            <div className="animate-float mb-8">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white/50 tracking-wider uppercase">{language === 'zh' ? '搜索结果' : 'Search Result'}</span>
                    <button 
                        onClick={handlePin}
                        className="px-4 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs rounded-full transition-colors flex items-center gap-2 backdrop-blur-md"
                    >
                        <span>+</span> {t.pin}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                     <WeatherCard 
                        weather={searchResult} 
                        isActive={true} 
                        onClick={() => {}} 
                        language={language}
                        t={t}
                    />
                </div>
            </div>
        )}

        {/* Pinned Cities Grid */}
        <div>
             {pinnedCities.length > 0 && (
                 <h3 className="text-sm font-medium text-white/50 tracking-wider uppercase mb-6">
                     {language === 'zh' ? '已保存城市' : 'Saved Cities'}
                 </h3>
             )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pinnedCities.map((weather) => (
                <WeatherCard 
                    key={weather.id}
                    weather={weather}
                    isActive={activeWeather?.id === weather.id}
                    onClick={() => setActiveWeather(weather)}
                    onDelete={(e) => handleDelete(e, weather.id)}
                    language={language}
                    t={t}
                />
            ))}
            {pinnedCities.length === 0 && !searchResult && (
                <div className="col-span-full h-40 flex items-center justify-center border border-dashed border-white/10 rounded-3xl text-white/30 text-sm">
                    {language === 'zh' ? '暂无保存城市，请搜索并添加' : 'No saved cities. Search to add.'}
                </div>
            )}
            </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-6 w-full text-center pointer-events-none left-0">
        <p className={`text-[10px] text-white/20 font-light tracking-[0.3em] uppercase ${language === 'en' ? 'text-[9px]' : ''}`}>{t.design}</p>
      </footer>
    </div>
  );
};

// Sub-component for Card to keep main clean
const WeatherCard = ({ weather, isActive, onClick, onDelete, language, t }: any) => {
    return (
        <button
            onClick={onClick}
            className={`
            relative h-[360px] rounded-[32px] p-6 text-left transition-all duration-500 ease-out group outline-none w-full
            ${isActive 
                ? 'scale-105 ring-1 ring-white/30 z-10 shadow-2xl shadow-black/50' 
                : 'hover:scale-[1.02] opacity-70 hover:opacity-100'}
            glass-panel
            `}
        >
            {/* Background Animation Component */}
            <div className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-[32px]">
                <WeatherAnimation type={weather.type} />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col justify-between h-full">
            
            {/* Top Info: City Name & Temp */}
            <div className="flex justify-between items-start w-full">
                <div className="w-full">
                    <h2 className={`text-2xl font-semibold tracking-wide mb-1 truncate pr-6 ${language === 'en' ? 'font-light tracking-widest' : ''}`}>
                        {weather.city}
                    </h2>
                    <span className="block text-6xl font-extralight tracking-tighter mt-4">
                        {weather.temp}°
                    </span>
                    <div className="mt-2 text-sm font-medium text-white/60 flex gap-3">
                        <span>{t.high}:{weather.high}°</span>
                        <span>{t.low}:{weather.low}°</span>
                    </div>
                </div>
                {onDelete && (
                    <div 
                        onClick={onDelete}
                        className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-red-400 text-white/40"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                )}
            </div>

            {/* Bottom Info: Condition */}
            <div>
                <p className={`text-lg text-white/80 font-medium ${language === 'en' ? 'text-sm font-light uppercase tracking-widest' : ''}`}>
                    {weather.label}
                </p>
            </div>
            </div>

            {/* Selection Indicator */}
            {isActive && (
                <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)]" />
            )}
        </button>
    );
}

export default App;