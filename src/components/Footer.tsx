import { motion } from 'framer-motion';
import { Github, Linkedin, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-12 border-t border-border/50">
      <div className="container px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.a
            href="#home"
            whileHover={{ scale: 1.05 }}
            className="text-lg font-bold font-mono"
          >
            <span className="text-primary">{'<'}</span>
            <span className="text-foreground">Jatin Patil</span>
            <span className="text-primary">{'/>'}</span>
          </motion.a>

          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Built with</span>
            <span>by Jatin Patil © {new Date().getFullYear()}</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <motion.a
              href="https://github.com/jatin8469"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="https://linkedin.com/in/jatin-patil-b75146376"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
              className="text-muted-foreground hover:text-secondary transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </motion.a>
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -3 }}
              className="ml-4 p-2 rounded-full glass-card text-primary hover:glow-cyan transition-all"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
