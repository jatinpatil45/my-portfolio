import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';
import { Award, X } from 'lucide-react';

interface CertificationCard {
  id: number;
  title: string;
  organization: string;
  image: string;
  alt: string;
}

const Certifications = () => {
  const [selectedCert, setSelectedCert] = useState<CertificationCard | null>(null);
  const certifications: CertificationCard[] = [
    {
      id: 1,
      title: 'Complete 2025 Python Bootcamp: Learn Python from Scratch',
      organization: 'CodeWithHarry',
      image: '/images/cert-python-bootcamp.jpg',
      alt: 'Python Bootcamp Certificate',
    },
    {
      id: 2,
      title: 'Build a Computer Vision App with Azure Cognitive Services',
      organization: 'Microsoft Learn',
      image: '/images/cert-azure-vision.jpg',
      alt: 'Azure Cognitive Services Certificate',
    },
    {
      id: 3,
      title: 'Data Science Professional',
      organization: 'IBM',
      image: '/images/cert-ds.jpg',
      alt: 'Data Science Professional Certificate',
    },
    {
      id: 4,
      title: 'Cloud Architecture Essentials',
      organization: 'AWS',
      image: '/images/cert-cloud.jpg',
      alt: 'Cloud Architecture Certificate',
    },
    {
      id: 5,
      title: 'Full Stack Development',
      organization: 'Udemy',
      image: '/images/cert-fullstack.jpg',
      alt: 'Full Stack Development Certificate',
    },
    {
      id: 6,
      title: 'Artificial Intelligence Fundamentals',
      organization: 'Microsoft Learn',
      image: '/images/cert-ai.jpg',
      alt: 'AI Fundamentals Certificate',
    },
  ];

  return (
    <section id="certifications" className="relative py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-[100px]" />

      <div className="container relative z-10 px-6">
        <ScrollReveal>
          <SectionHeading
            label="06. Certifications"
            title="Professional Credentials"
            description="Industry-recognized certifications demonstrating expertise in AI/ML, web development, and cloud technologies"
          />
        </ScrollReveal>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {certifications.map((cert, index) => (
            <ScrollReveal key={cert.id} delay={0.1 + index * 0.05}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative h-full cursor-pointer"
                onClick={() => setSelectedCert(cert)}
              >
                {/* Card Container */}
                <div className="relative rounded-2xl overflow-hidden glass-card p-4 h-full flex flex-col hover:glow-cyan transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden bg-card/50">
                    <img
                      src={cert.image}
                      alt={cert.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback for missing images
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Fallback Icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <Award className="w-12 h-12 text-primary/50" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-300">
                      {cert.title}
                    </h3>

                    {/* Organization */}
                    <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground font-mono">
                        {cert.organization}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover glow indicator */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 glow-purple pointer-events-none" />
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Call to action */}
        <ScrollReveal delay={0.5}>
          <div className="mt-16 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm font-mono mb-4"
            >
              More certifications coming soon...
            </motion.p>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-6 py-2 glass-card rounded-lg text-primary font-mono text-sm glow-cyan hover:glow-purple transition-all duration-300"
            >
              Get In Touch →
            </motion.a>
          </div>
        </ScrollReveal>

        {/* Modal/Lightbox */}
        <AnimatePresence>
          {selectedCert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCert(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[90vh] bg-card rounded-2xl overflow-hidden glass-card"
              >
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCert(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-background/80 hover:bg-background transition-colors"
                >
                  <X className="w-6 h-6 text-foreground" />
                </motion.button>

                {/* Content */}
                <div className="h-full flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="w-full md:w-2/3 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
                    <img
                      src={selectedCert.image}
                      alt={selectedCert.alt}
                      className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Fallback for missing image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Award className="w-24 h-24 text-primary/30" />
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl md:text-3xl font-bold text-foreground mb-4"
                      >
                        {selectedCert.title}
                      </motion.h2>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-block w-3 h-3 rounded-full bg-primary" />
                          <p className="text-lg text-muted-foreground font-mono">
                            Issued by: <span className="text-foreground font-semibold">{selectedCert.organization}</span>
                          </p>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                          <p className="text-sm text-muted-foreground mb-3">
                            Click the image to view or download the full certificate.
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Action Button */}
                    <motion.a
                      href={selectedCert.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-6 px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg font-mono text-sm transition-all duration-300 text-center glow-cyan"
                    >
                      View Full Certificate
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Certifications;
