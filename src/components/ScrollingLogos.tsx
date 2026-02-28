import React from 'react';

interface LogoItem {
    name: string;
    url: string;
    invertDark?: boolean;
}

interface ScrollingLogosProps {
    logos: LogoItem[];
}

const ScrollingLogos: React.FC<ScrollingLogosProps> = ({ logos }) => {
    return (
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] mt-8 pt-4 border-t border-border/50">
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 [&_img]:max-w-none animate-infinite-scroll hover:[animation-play-state:paused] will-change-transform">
                {logos.map((logo, index) => (
                    <li key={`logo-1-${index}`} className="flex flex-col items-center justify-center space-y-2 opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300">
                        <img src={logo.url} alt={logo.name} className={`w-10 h-10 md:w-12 md:h-12 object-contain ${logo.invertDark ? 'invert [.light_&]:invert-0' : ''}`} />
                        <span className="text-xs font-mono text-muted-foreground">{logo.name}</span>
                    </li>
                ))}
                {/* Duplicate the list for infinite scrolling */}
                {logos.map((logo, index) => (
                    <li key={`logo-2-${index}`} className="flex flex-col items-center justify-center space-y-2 opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300">
                        <img src={logo.url} alt={logo.name} className={`w-10 h-10 md:w-12 md:h-12 object-contain ${logo.invertDark ? 'invert [.light_&]:invert-0' : ''}`} />
                        <span className="text-xs font-mono text-muted-foreground">{logo.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScrollingLogos;
