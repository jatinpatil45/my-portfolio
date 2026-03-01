import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Send, MapPin, Sparkles } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';

const Contact = () => {
  const contactMethods = [
    {
      icon: (props: any) => (
        <svg viewBox="0 0 24 24" {...props}>
          <path fill="#EA4335" d="M24 4.5v15c0 .85-.65 1.5-1.5 1.5H21V7.38l-9 5.65-9-5.65V21H1.5c-.85 0-1.5-.65-1.5-1.5v-15c0-.4.15-.75.45-1.05.3-.3.65-.45 1.05-.45H3.4l8.6 5.4 8.6-5.4h1.95c.4 0 .75.15 1.05.45.3.3.45.65.45 1.05z" />
        </svg>
      ),
      label: 'Email',
      value: 'jatinpatil2233@gmail.com',
      href: 'mailto:jatinpatil2233@gmail.com',
      color: 'primary',
    },
    {
      icon: (props: any) => (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
          alt="GitHub"
          className={`invert [.light_&]:invert-0 ${props.className || ''}`}
        />
      ),
      label: 'GitHub',
      value: 'github.com/jatin8469',
      href: 'https://github.com/jatin8469',
      color: 'secondary',
    },
    {
      icon: (props: any) => (
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linkedin/linkedin-original.svg"
          alt="LinkedIn"
          className={props.className || ''}
        />
      ),
      label: 'LinkedIn',
      value: 'Jatin Patil',
      href: 'https://linkedin.com/in/jatin-patil-b75146376',
      color: 'primary',
    },
  ];

  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-primary/20 to-secondary/10 rounded-full blur-[150px]" />

      <div className="container relative z-10 px-6">
        <ScrollReveal>
          <SectionHeading
            label="07. Contact"
            title="Let's Connect"
            description="Have a project in mind or just want to chat? I'd love to hear from you!"
          />
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          {/* CTA Card */}
          <ScrollReveal delay={0.2}>
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card neon-border rounded-3xl p-8 md:p-12 text-center mb-12 hover:glow-mixed transition-all duration-500"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-6"
              >
                <Sparkles className="w-12 h-12 text-primary" />
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to Build Something <span className="text-gradient">Amazing</span>?
              </h3>

              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Whether it's an AI-powered application, a full-stack web solution, or
                data-driven insights—let's collaborate and turn ideas into reality.
              </p>

              <motion.a
                href="mailto:jatinpatil2233@gmail.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-primary rounded-xl font-semibold text-primary-foreground glow-cyan hover:glow-purple transition-all duration-300"
              >
                <Send className="w-5 h-5" />
                Say Hello
              </motion.a>
            </motion.div>
          </ScrollReveal>

          {/* Contact Methods */}
          <div className="grid sm:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <ScrollReveal key={method.label} delay={0.3 + index * 0.1}>
                <motion.a
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5 }}
                  className={`
                    block glass-card rounded-2xl p-6 text-center
                    hover:glow-${method.color === 'primary' ? 'cyan' : 'purple'} 
                    transition-all duration-300 group
                  `}
                >
                  <div className={`
                    w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center
                    ${method.color === 'primary' ? 'bg-primary/5' : 'bg-secondary/5'}
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <method.icon className="w-7 h-7" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1 font-mono">{method.label}</p>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {method.value}
                  </p>
                </motion.a>
              </ScrollReveal>
            ))}
          </div>

          {/* Location */}
          <ScrollReveal delay={0.6}>
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">Gujarat, India</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
