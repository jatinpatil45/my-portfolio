import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Send, MapPin, Sparkles } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';

const Contact = () => {
  const contactMethods = [
    {
      icon: Mail,
      label: 'Email',
      value: 'jatinpatil2233@gmail.com',
      href: 'mailto:jatinpatil2233@gmail.com',
      color: 'primary',
    },
    {
      icon: Github,
      label: 'GitHub',
      value: 'github.com/jatin8469',
      href: 'https://github.com/jatin8469',
      color: 'secondary',
    },
    {
      icon: Linkedin,
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
                    ${method.color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'}
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <method.icon className={`w-7 h-7 ${
                      method.color === 'primary' ? 'text-primary' : 'text-secondary'
                    }`} />
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
