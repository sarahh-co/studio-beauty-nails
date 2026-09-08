import Container from "./Container";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={`py-16 sm:py-24 ${className ?? ""}`}>
      <Container>{children}</Container>
    </section>
  );
}
