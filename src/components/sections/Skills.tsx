import { motion } from 'framer-motion';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Languages',
      icon: '💻',
      color: 'primary',
      skills: ['C', 'C++', 'Python', 'Java', 'C#', 'JavaScript', 'TypeScript'],
    },
    {
      title: 'Web Development',
      icon: '🌐',
      color: 'secondary',
      skills: ['HTML5', 'CSS3', 'React', 'Angular', 'Node.js', 'Express', 'REST APIs'],
    },
    {
      title: 'Data Science & AI',
      icon: '🤖',
      color: 'accent',
      skills: ['NumPy', 'Pandas', 'Scikit-Learn', 'TensorFlow', 'SQL', 'DBMS', 'Data Visualization'],
    },
    {
      title: 'Tools & Platforms',
      icon: '🛠️',
      color: 'primary',
      skills: ['Git', 'GitHub', 'VS Code', 'Jupyter', 'Docker', 'Linux', 'Figma'],
    },
  ];

  return (
    <section id="skills" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />

      <div className="container relative z-10 px-6">
        <ScrollReveal>
          <SectionHeading
            label="03. Skills"
            title="Tech Arsenal"
            description="A diverse toolkit spanning from low-level programming to cutting-edge AI"
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {skillCategories.map((category, categoryIndex) => (
            <ScrollReveal
              key={category.title}
              delay={categoryIndex * 0.15}
              direction={categoryIndex % 2 === 0 ? 'left' : 'right'}
            >
              <motion.div
                whileHover={{ y: -5 }}
                className="glass-card neon-border rounded-2xl p-6 h-full hover:glow-mixed transition-all duration-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + skillIndex * 0.05 }}
                      viewport={{ once: true }}
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: category.color === 'primary' 
                          ? '0 0 20px hsl(187 100% 42% / 0.5)'
                          : '0 0 20px hsl(270 80% 60% / 0.5)'
                      }}
                      className={`
                        px-4 py-2 text-sm font-mono rounded-lg cursor-default
                        transition-all duration-300
                        ${category.color === 'primary' 
                          ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20' 
                          : 'bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20'
                        }
                      `}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Extra-curricular badges */}
        <ScrollReveal delay={0.6}>
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground mb-6 font-mono">{'// Extra-curricular'}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Open Source Contributor', 'AI/ML Workshop Participant', 'University Hackathons'].map((item, index) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3 }}
                  className="px-5 py-2.5 glass-card rounded-full text-sm text-foreground hover:glow-cyan transition-all duration-300"
                >
                  ✨ {item}
                </motion.span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Skills;
