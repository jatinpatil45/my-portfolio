import { motion } from 'framer-motion';
import { User, Code, Brain, Sparkles } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';

const About = () => {
  const highlights = [
    { icon: Brain, label: 'AI/ML Focus', value: 'Specializing in Intelligent Systems' },
    { icon: Code, label: 'Full Stack', value: 'React, Node.js, Python' },
    { icon: Sparkles, label: 'Innovation', value: 'Building Tomorrow\'s Solutions' },
  ];

  return (
    <section id="about" className="relative py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="container relative z-10 px-6">
        <ScrollReveal>
          <SectionHeading
            label="02. About Me"
            title="Know Who I Am"
            description="Passionate about transforming ideas into intelligent, scalable solutions"
          />
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image/Avatar side */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative aspect-square max-w-md mx-auto"
              >
                {/* Decorative frame */}
                <div className="absolute inset-4 rounded-2xl neon-border glass-card" />
                
                {/* Main avatar container */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden glass-card flex items-center justify-center">
                  <img 
                    src="/images/profile.jpg" 
                    alt="Jatin Patil" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -right-4 px-4 py-2 glass-card rounded-full text-sm font-mono text-primary glow-cyan"
                >
                  🎓 BE Student
                </motion.div>
                
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 px-4 py-2 glass-card rounded-full text-sm font-mono text-secondary glow-purple"
                >
                  💻 2nd Year
                </motion.div>
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Content side */}
          <ScrollReveal direction="right" delay={0.4}>
            <div className="space-y-6">
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  I'm <span className="text-primary font-semibold">Jatin Narayanbhai Patil</span>, 
                  a passionate BE Computer Engineering student at 
                  <span className="text-foreground"> UPL University of Sustainable Technology</span> (Sem 4).
                </p>
                
                <p className="leading-relaxed">
                  My journey began with web development, crafting interactive experiences 
                  with React and Node.js. But the allure of <span className="text-secondary">artificial intelligence</span> drew 
                  me deeper into the realm of data science and machine learning.
                </p>
                
                <p className="leading-relaxed">
                  Today, I'm bridging these worlds—building intelligent web applications that 
                  leverage the power of AI to solve real-world problems. From predictive 
                  health analytics to smart city solutions, I'm passionate about creating 
                  technology that makes a difference.
                </p>
              </div>

              {/* Highlights */}
              <div className="grid sm:grid-cols-3 gap-4 pt-6">
                {highlights.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    className="p-4 glass-card rounded-xl text-center group hover:glow-cyan transition-all duration-300"
                  >
                    <item.icon className="w-8 h-8 mx-auto mb-2 text-primary group-hover:text-secondary transition-colors" />
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default About;
