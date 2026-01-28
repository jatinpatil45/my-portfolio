interface SectionHeadingProps {
  label: string;
  title: string;
  description?: string;
}

const SectionHeading = ({ label, title, description }: SectionHeadingProps) => {
  return (
    <div className="text-center mb-16">
      <span className="inline-block px-4 py-1.5 text-xs font-mono text-primary bg-primary/10 rounded-full border border-primary/20 mb-4">
        {label}
      </span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
        <span className="text-gradient">{title}</span>
      </h2>
      {description && (
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
