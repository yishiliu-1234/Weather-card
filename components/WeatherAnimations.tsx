import React from 'react';
import { WeatherType } from '../types';

interface AnimationProps {
  type: WeatherType;
}

export const WeatherAnimation: React.FC<AnimationProps> = ({ type }) => {
  switch (type) {
    case WeatherType.SUNNY:
      return <SunnyAnimation />;
    case WeatherType.RAINY:
      return <RainyAnimation />;
    case WeatherType.SNOWY:
      return <SnowyAnimation />;
    case WeatherType.WINDY:
      return <WindyAnimation />;
    default:
      return null;
  }
};

const SunnyAnimation = () => (
  <div className="absolute inset-0 overflow-hidden rounded-3xl">
    {/* Sun Glow */}
    <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] bg-orange-400 rounded-full blur-[60px] opacity-60 animate-pulse-glow" />
    <div className="absolute top-[-10%] right-[-10%] w-[120px] h-[120px] bg-yellow-300 rounded-full blur-[40px] opacity-80" />
    
    {/* Sun Body */}
    <svg className="absolute top-8 right-8 w-24 h-24 text-yellow-100 animate-spin-slow" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="20" fill="currentColor" className="text-yellow-200" />
      {[...Array(8)].map((_, i) => (
        <line
          key={i}
          x1="50" y1="20" x2="50" y2="5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${i * 45} 50 50)`}
          className="opacity-80"
        />
      ))}
    </svg>

    {/* Light Rays */}
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-500/10 to-yellow-500/20 mix-blend-overlay" />
  </div>
);

const RainyAnimation = () => (
  <div className="absolute inset-0 overflow-hidden rounded-3xl bg-blue-900/10">
    {/* Clouds */}
    <div className="absolute top-4 left-4 w-32 h-12 bg-gray-400/30 rounded-full blur-xl animate-drift" />
    <div className="absolute top-8 right-8 w-40 h-16 bg-gray-500/30 rounded-full blur-xl animate-drift" style={{ animationDelay: '2s' }} />

    {/* Rain Drops */}
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-[1px] h-[15px] bg-blue-200/60 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 20}px`,
          animation: `rain-drop ${0.8 + Math.random() * 0.5}s linear infinite`,
          animationDelay: `-${Math.random() * 2}s`
        }}
      />
    ))}
    
    {/* Cloud SVG */}
    <svg className="absolute top-6 left-6 w-20 h-20 text-gray-300/80 animate-float" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.519,0.075-1.018,0.213-1.492C11.391,12.005,10.709,12,10,12c-3.314,0-6,2.686-6,6 s2.686,6,6,6h7.5c2.485,0,4.5-2.015,4.5-4.5S19.985,15,17.5,15z" opacity="0.6"/>
      <path d="M17,17c-2.761,0-5-2.239-5-5s2.239-5,5-5s5,2.239,5,5S19.761,17,17,17z" />
    </svg>
  </div>
);

const SnowyAnimation = () => (
  <div className="absolute inset-0 overflow-hidden rounded-3xl bg-slate-800/20">
    {/* Background Glow */}
    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/10 to-transparent" />

    {/* Snowflakes */}
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1.5 h-1.5 bg-white rounded-full blur-[0.5px]"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 20}px`,
          opacity: Math.random(),
          animation: `snow-drop ${3 + Math.random() * 4}s linear infinite`,
          animationDelay: `-${Math.random() * 5}s`,
          transform: `scale(${0.5 + Math.random()})`
        }}
      />
    ))}

    {/* Large Snowflake Icon */}
    <svg className="absolute bottom-8 right-8 w-16 h-16 text-white/20 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
       <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
       <path d="M12 2v0M12 22v0M2 12h0M22 12h0M4.93 4.93l0 0M19.07 19.07l0 0M19.07 4.93l0 0M4.93 19.07l0 0" strokeLinecap="round" strokeWidth="3"/>
    </svg>
  </div>
);

const WindyAnimation = () => (
  <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gray-800/10">
    {/* Wind Lines */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="absolute h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
        style={{
          width: '100px',
          left: '-100px',
          top: `${20 + i * 15}%`,
          animation: `wind-rush ${1.5 + Math.random()}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}

    {/* Moving Clouds */}
    <div className="absolute top-10 left-[-20%] w-32 h-10 bg-gray-400/20 rounded-full blur-md animate-wind-rush" style={{ animationDuration: '4s' }} />
    <div className="absolute top-20 left-[-20%] w-24 h-8 bg-gray-500/20 rounded-full blur-md animate-wind-rush" style={{ animationDuration: '3s', animationDelay: '1s' }} />

    {/* Wind Icon */}
    <svg className="absolute bottom-6 left-6 w-16 h-16 text-gray-300/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  </div>
);