export default function SkillDots({ level = 1 }) {
  return (
    <span className="skill-dots" aria-label={`Level ${level} of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={`skill-dots__dot ${index < level ? 'is-filled' : ''}`} aria-hidden="true" />
      ))}
    </span>
  );
}
