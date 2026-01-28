import { motion } from 'framer-motion';
import { ExternalLink, Github, Brain, Globe, Zap, Code } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';
import TiltCard from '../TiltCard';

const Projects = () => {
  const projects = [
    {
      title: 'Predictive Health Suite',
      description: 'AI-powered diagnostic tool analyzing patient data to identify early-stage chronic illness indicators with high accuracy.',
      tech: ['Python', 'Pandas', 'Scikit-Learn', 'NumPy'],
      category: 'AI/ML',
      icon: Brain,
      color: 'primary',
      featured: true,
    },
    {
      title: 'E-Commerce Nexus',
      description: 'Full-stack e-commerce platform with real-time inventory, secure payments, and responsive design.',
      tech: ['React', 'Node.js', 'Express', 'MongoDB'],
      category: 'Full Stack',
      icon: Globe,
      color: 'secondary',
      featured: true,
    },
    {
      title: 'Smart City Traffic Analyzer',
      description: 'Deep learning model optimizing traffic flow patterns using computer vision and predictive analytics.',
      tech: ['Python', 'TensorFlow', 'OpenCV', 'Deep Learning'],
      category: 'Deep Learning',
      icon: Zap,
      color: 'primary',
      featured: true,
    },
    {
      title: 'AI-Powered Sales Forecaster',
      description: 'Machine learning model using Linear Regression to predict quarterly sales trends with 90%+ accuracy.',
      tech: ['Python', 'Pandas', 'Linear Regression', 'Matplotlib'],
      category: 'AI/ML',
      icon: Brain,
      color: 'secondary',
      featured: false,
    },
    {
      title: 'MERN Stack Dashboard',
      description: 'Sleek administrative dashboard with live data visualization and real-time updates.',
      tech: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
      category: 'Full Stack',
      icon: Globe,
      color: 'primary',
      featured: false,
    },
    {
      title: 'Portfolio Engine',
      description: 'This animated portfolio showcasing modern web development with stunning cyberpunk aesthetics.',
      tech: ['React', 'Framer Motion', 'Tailwind CSS', 'TypeScript'],
      category: 'Web',
      icon: Code,
      color: 'secondary',
      featured: false,
    },
  ];

  return (
    <section id="projects" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

      <div className="container relative z-10 px-6">
        <ScrollReveal>
          <SectionHeading
            label="04. Projects"
            title="Featured Work"
            description="A showcase of projects spanning AI/ML, full-stack development, and data science"
          />
        </ScrollReveal>

        {/* Featured Projects */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {projects.filter(p => p.featured).map((project, index) => (
            <ScrollReveal key={project.title} delay={index * 0.15}>
              <TiltCard className="h-full" tiltAmount={10}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="h-full glass-card neon-border rounded-2xl p-6 flex flex-col hover:glow-mixed transition-all duration-500 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      project.color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'
                    }`}>
                      <project.icon className={`w-6 h-6 ${
                        project.color === 'primary' ? 'text-primary' : 'text-secondary'
                      }`} />
                    </div>
                    <span className={`px-3 py-1 text-xs font-mono rounded-full ${
                      project.color === 'primary' 
                        ? 'bg-primary/10 text-primary border border-primary/30' 
                        : 'bg-secondary/10 text-secondary border border-secondary/30'
                    }`}>
                      {project.category}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-gradient transition-all">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-4">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs font-mono text-muted-foreground bg-muted/50 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Hover Links */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      className="p-3 rounded-full glass-card glow-cyan"
                    >
                      <Github className="w-5 h-5 text-primary" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      className="p-3 rounded-full glass-card glow-purple"
                    >
                      <ExternalLink className="w-5 h-5 text-secondary" />
                    </motion.a>
                  </motion.div>
                </motion.div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Other Projects */}
        <ScrollReveal delay={0.4}>
          <div className="max-w-6xl mx-auto">
            <p className="text-sm text-muted-foreground mb-6 font-mono text-center">{'// More Projects'}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.filter(p => !p.featured).map((project, index) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3 }}
                  className="glass-card rounded-xl p-5 hover:glow-cyan transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <project.icon className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.tech.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-xs font-mono text-primary/70">
                        {tech}{project.tech.indexOf(tech) < 2 ? ' •' : ''}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Projects;
