import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import TypingAnimation from '../TypingAnimation';
import TiltCard from '../TiltCard';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';

const Hero = () => {
  const socialLinks = [
    {
      icon: (props: any) => (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
          alt="GitHub"
          className={`invert [.light_&]:invert-0 ${props.className || ''}`}
        />
      ),
      href: 'https://github.com/jatinpatil45',
      label: 'GitHub'
    },
    {
      icon: (props: any) => (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linkedin/linkedin-original.svg"
          alt="LinkedIn"
          className={props.className || ''}
        />
      ),
      href: 'https://linkedin.com/in/jatin-patil-b75146376',
      label: 'LinkedIn'
    },
    {
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" {...props}>
          <path fill="#EA4335" d="M24 4.5v15c0 .85-.65 1.5-1.5 1.5H21V7.38l-9 5.65-9-5.65V21H1.5c-.85 0-1.5-.65-1.5-1.5v-15c0-.4.15-.75.45-1.05.3-.3.65-.45 1.05-.45H3.4l8.6 5.4 8.6-5.4h1.95c.4 0 .75.15 1.05.45.3.3.45.65.45 1.05z" />
        </svg>
      ),
      href: 'mailto:jatinpatil2233@gmail.com',
      label: 'Email'
    },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container relative z-10 px-6">
        <ScrollReveal>
          <SectionHeading
            label="Home"
            title=""
            description=""
          />
        </ScrollReveal>

        <TiltCard className="max-w-4xl mx-auto" tiltAmount={5}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Code-like intro */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-mono text-primary text-sm md:text-base mb-4"
            >
              {'<Developer>'}
            </motion.p>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
            >
              <span className="text-gradient">Jatin</span>
              <span className="text-gradient"> Patil</span>
            </motion.h1>

            {/* Tagline with typing effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-8 h-16 flex items-center justify-center"
            >
              <TypingAnimation
                text="Engineering Intelligent Solutions: Where Data Science Meets Modern Web Development."
                speed={35}
                delay={1200}
              />
            </motion.div>

            {/* Role badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {['AI/ML Engineer', 'Full Stack Developer', 'Data Scientist'].map((role, index) => (
                <motion.span
                  key={role}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  className="px-4 py-2 text-sm font-mono rounded-full glass-card neon-border text-primary"
                >
                  {role}
                </motion.span>
              ))}
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="flex justify-center gap-4"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl glass-card glow-cyan hover:glow-purple transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 + index * 0.1 }}
                >
                  <social.icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                </motion.a>
              ))}
            </motion.div>

            {/* Code-like outro */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              className="font-mono text-primary text-sm md:text-base mt-8"
            >
              {'</Developer>'}
            </motion.p>
          </motion.div>
        </TiltCard>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.a
            href="#about"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="text-xs font-mono">scroll</span>
            <ChevronDown className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
