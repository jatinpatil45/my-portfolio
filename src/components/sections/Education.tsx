import { motion } from 'framer-motion';
import { GraduationCap, Calendar, MapPin, Award } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';

const Education = () => {
  const education = [
    {
      degree: 'Bachelor of Engineering',
      field: 'Computer Engineering',
      institution: 'UPL University of Sustainable Technology',
      year: '2023 - Present (2nd Year)',
      status: 'In Progress',
      highlight: 'Specializing in AI/ML',
      icon: '🎓',
    },
    {
      degree: 'Higher Secondary (12th)',
      field: 'Science Stream',
      institution: 'GNFC Narmada Vidhyalay',
      year: 'Completed',
      status: '62%',
      highlight: 'Foundation in Sciences',
      icon: '📚',
    },
    {
      degree: 'Secondary (10th)',
      field: 'General Education',
      institution: 'GNFC',
      year: 'Completed',
      status: '72% Marks | 82.53 Percentile',
      highlight: 'Strong Academic Foundation',
      icon: '🏆',
    },
  ];

  return (
    <section id="education" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

      <div className="container relative z-10 px-6">
        <ScrollReveal>
          <SectionHeading
            label="02. Education"
            title="Academic Journey"
            description="Building a strong foundation in computer science and engineering"
          />
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-transparent" />

            {education.map((edu, index) => (
              <ScrollReveal key={index} delay={index * 0.2}>
                <motion.div
                  whileHover={{ x: 10 }}
                  className="relative pl-20 pb-12 last:pb-0 group"
                >
                  {/* Timeline dot */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="absolute left-4 w-8 h-8 rounded-full glass-card flex items-center justify-center text-lg group-hover:glow-cyan transition-all duration-300"
                  >
                    {edu.icon}
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card neon-border rounded-2xl p-6 hover:glow-mixed transition-all duration-500"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          {edu.degree}
                        </h3>
                        <p className="text-primary font-medium">{edu.field}</p>
                      </div>
                      <span className="px-3 py-1 text-xs font-mono rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                        {edu.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{edu.institution}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{edu.year}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-secondary" />
                        <span className="text-secondary">{edu.highlight}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
