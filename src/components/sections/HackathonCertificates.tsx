import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, ExternalLink, Eye, X, Building2, Hash } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';
import SectionHeading from '../SectionHeading';
import hackathonCertificatesData, {
  HackathonCertificate,
} from '@/data/hackathonCertificates';

interface HackathonCertificatesProps {
  certificates?: HackathonCertificate[];
}

function getAchievementBadgeStyle(type: string) {
  const normalized = type.trim().toLowerCase();
  if (normalized.includes('winner') || normalized.includes('1st') || normalized.includes('first')) {
    return 'bg-amber-500/15 text-amber-400 border-amber-400/40';
  }
  if (
    normalized.includes('finalist') ||
    normalized.includes('runner') ||
    normalized.includes('top')
  ) {
    return 'bg-secondary/15 text-secondary border-secondary/40';
  }
  return 'bg-primary/15 text-primary border-primary/40';
}

const HackathonCertificates = ({
  certificates = hackathonCertificatesData,
}: HackathonCertificatesProps) => {
  const [selectedCert, setSelectedCert] = useState<HackathonCertificate | null>(null);

  useEffect(() => {
    if (!selectedCert) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCert(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCert]);

  const gridColsClass =
    certificates.length === 1
      ? 'grid-cols-1 max-w-xl'
      : certificates.length === 2
      ? 'grid-cols-1 md:grid-cols-2 max-w-5xl'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl';

  return (
    <section id="hackathon-certificates" className="relative py-32 overflow-hidden">
      {/* Background elements matching portfolio visual language */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/3 -left-16 w-[28rem] h-[28rem] rounded-full orb-primary" />
      <div className="absolute bottom-1/4 -right-16 w-[26rem] h-[26rem] rounded-full orb-secondary" />

      <div className="container relative z-10 px-6">
        <ScrollReveal>
          <SectionHeading
            label="Hackathons"
            title="Hackathon Certificates"
            description="Verified credentials from hackathons showcasing collaborative problem-solving, rapid prototyping, and innovation"
          />
        </ScrollReveal>

        {certificates.length === 0 ? (
          /* Clear Empty State */
          <ScrollReveal delay={0.15}>
            <div className="max-w-xl mx-auto glass-card neon-border rounded-2xl p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No Hackathon Certificates Yet
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                Upcoming hackathon credentials and achievements will appear here once added.
              </p>
            </div>
          </ScrollReveal>
        ) : (
          /* Hackathon Certificates Grid */
          <div className={`grid ${gridColsClass} gap-6 mx-auto`}>
            {certificates.map((cert, index) => (
              <ScrollReveal key={cert.id} delay={0.1 + index * 0.08}>
                <motion.article
                  whileHover={{ y: -8, scale: 1.015 }}
                  transition={{ duration: 0.28 }}
                  onClick={() => setSelectedCert(cert)}
                  className="group relative h-full cursor-pointer"
                >
                  <div className="relative rounded-2xl overflow-hidden glass-card neon-border p-5 h-full flex flex-col hover:glow-cyan transition-shadow duration-300">
                    {/* Certificate Image Preview */}
                    <div className="relative w-full aspect-[16/11] mb-5 rounded-xl overflow-hidden bg-card/60 border border-border/50">
                      {/* Fallback Icon Underneath */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 to-secondary/15">
                        <Trophy className="w-12 h-12 text-primary/40" />
                      </div>

                      <img
                        src={cert.image}
                        alt={cert.alt}
                        loading="lazy"
                        decoding="async"
                        className="relative z-[1] w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />

                      {/* Achievement Type Badge Overlay */}
                      <div className="absolute top-3 right-3 z-[2]">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold backdrop-blur-md border shadow-sm ${getAchievementBadgeStyle(
                            cert.achievementType
                          )}`}
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          {cert.achievementType}
                        </span>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Date / Year */}
                        <div className="flex items-center gap-2 text-xs font-mono text-primary mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{cert.date}</span>
                        </div>

                        {/* Hackathon Name */}
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-300">
                          {cert.hackathonName}
                        </h3>

                        {/* Organizer Name */}
                        <div className="flex items-start gap-2 pt-3 border-t border-border/50">
                          <span className="inline-block w-2 h-2 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                          <p className="text-xs md:text-sm text-muted-foreground font-mono leading-relaxed">
                            {cert.organizer}
                          </p>
                        </div>
                      </div>

                      {/* View Certificate Action Button */}
                      <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCert(cert);
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 font-mono text-xs md:text-sm font-medium transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          View Certificate
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtle hover aura matching Certifications section */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 glow-purple pointer-events-none" />
                </motion.article>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Full Certificate Lightbox Modal */}
        <AnimatePresence>
          {selectedCert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCert(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label={selectedCert.hackathonName}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl glass-card neon-border"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCert(null)}
                  aria-label="Close certificate preview"
                  className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-background/80 hover:bg-background text-foreground transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col lg:flex-row">
                  {/* Full Certificate Image Section */}
                  <div className="w-full lg:w-2/3 relative flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-5 md:p-8 min-h-[260px]">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Trophy className="w-20 h-20 text-primary/20" />
                    </div>
                    <a
                      href={selectedCert.credentialUrl || selectedCert.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full resolution certificate in new tab"
                      className="relative z-[1] block w-full"
                    >
                      <img
                        src={selectedCert.image}
                        alt={selectedCert.alt}
                        className="w-full h-auto max-h-[70vh] object-contain rounded-xl shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </a>
                  </div>

                  {/* Certificate Metadata & Actions */}
                  <div className="w-full lg:w-1/3 p-6 md:p-8 flex flex-col justify-between gap-6">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border mb-4 ${getAchievementBadgeStyle(
                          selectedCert.achievementType
                        )}`}
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        {selectedCert.achievementType}
                      </span>

                      <h3 className="text-2xl font-bold text-foreground mb-5 leading-snug">
                        {selectedCert.hackathonName}
                      </h3>

                      <div className="space-y-4 text-sm font-mono">
                        <div className="flex items-start gap-3">
                          <Building2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">
                            Organizer:{' '}
                            <span className="text-foreground font-semibold">
                              {selectedCert.organizer}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                          <p className="text-muted-foreground">
                            Date:{' '}
                            <span className="text-foreground font-semibold">
                              {selectedCert.date}
                            </span>
                          </p>
                        </div>

                        {selectedCert.certificateId && (
                          <div className="flex items-center gap-3">
                            <Hash className="w-4 h-4 text-primary flex-shrink-0" />
                            <p className="text-muted-foreground break-all">
                              Certificate ID:{' '}
                              <span className="text-foreground font-semibold">
                                {selectedCert.certificateId}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          Click the certificate image or the button below to view the full-size credential in a new tab.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <a
                        href={selectedCert.credentialUrl || selectedCert.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl font-mono text-sm font-medium transition-colors duration-200 glow-cyan"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {selectedCert.credentialUrl
                          ? 'Verify Credential'
                          : 'Open Full Certificate'}
                      </a>
                    </div>
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

export default HackathonCertificates;
