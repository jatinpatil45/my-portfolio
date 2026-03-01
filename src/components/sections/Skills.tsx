import { motion } from 'framer-motion';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';
import ScrollingLogos from '../ScrollingLogos';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Languages',
      icon: '💻',
      color: 'primary',
      logos: [
        { name: 'C', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg' },
        { name: 'C++', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg' },
        { name: 'Python', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
        { name: 'Java', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg' },
        { name: 'C#', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg' },
        { name: 'JavaScript', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
        { name: 'TypeScript', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
      ],
    },
    {
      title: 'Web Development',
      icon: '🌐',
      color: 'secondary',
      logos: [
        { name: 'HTML5', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
        { name: 'CSS3', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
        { name: 'React', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
        { name: 'Angular', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angularjs/angularjs-original.svg' },
        { name: 'Node.js', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
        { name: 'Express', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg', invertDark: true },
      ],
    },
    {
      title: 'Data Science & AI',
      icon: '🤖',
      color: 'accent',
      logos: [
        { name: 'NumPy', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original.svg' },
        { name: 'Pandas', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original.svg' },
        { name: 'Scikit-Learn', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg' },
        { name: 'TensorFlow', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg' },
        { name: 'SQL', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azuresqldatabase/azuresqldatabase-original.svg' },
      ],
    },
    {
      title: 'Tools & Platforms',
      icon: '🛠️',
      color: 'primary',
      logos: [
        { name: 'Git', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
        { name: 'GitHub', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg', invertDark: true },
        { name: 'VS Code', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg' },
        { name: 'Jupyter', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jupyter/jupyter-original.svg' },
        { name: 'Docker', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
        { name: 'Linux', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg' },
        { name: 'Figma', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg' },
      ],
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
            label="Skills"
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

                {/* Render scrolling logos for ALL categories */}
                <ScrollingLogos logos={category.logos} />
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
