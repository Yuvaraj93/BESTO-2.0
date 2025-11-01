import React from 'react';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
);

interface HeaderProps {
    remainingTokens: number;
}

const Header: React.FC<HeaderProps> = ({ remainingTokens }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center border-b border-slate-200">
            <div className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <LogoIcon className="w-6 h-6"/>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Besto</h1>
                    <p className="text-sm text-slate-500">Voice-powered productivity</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-semibold text-slate-800">{remainingTokens} / 1000</p>
                <p className="text-xs text-slate-500">Daily tokens remaining</p>
            </div>
        </div>
    </header>
  );
};

export default Header;