import { useEffect, useMemo, useState } from 'react';
import teacherLeft from '../assets/teacher-pose-left.webp';
import teacherThreeQuarter from '../assets/teacher-pose-three-quarter.webp';
import teacherFront from '../assets/teacher-pose-front.webp';
import studentFocused from '../assets/student-pose-focused.webp';
import studentLaughing from '../assets/student-pose-laughing.webp';
import studentConfident from '../assets/student-pose-confident.webp';

const scenes = {
  teacher: [teacherLeft, teacherThreeQuarter, teacherFront],
  student: [studentFocused, studentLaughing, studentConfident],
};

export default function ScrollCharacter({ variant = 'teacher', label = 'Illustration animée' }) {
  const [progress, setProgress] = useState(0);
  const frames = useMemo(() => scenes[variant] || scenes.teacher, [variant]);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
    };
    const onScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const activeFrame = Math.min(frames.length - 1, Math.floor(progress * frames.length));

  return (
    <aside className={`scroll-character scroll-character-${variant}`} aria-label={label}>
      <div className="scroll-character-glow" />
      {frames.map((frame, index) => (
        <img
          key={frame}
          src={frame}
          alt=""
          className={`scroll-character-frame ${index === activeFrame ? 'is-active' : ''}`}
          aria-hidden="true"
        />
      ))}
      <span className="scroll-character-caption">{variant === 'teacher' ? 'Transmettre' : 'Apprendre'}</span>
    </aside>
  );
}

export function FloatingLetters() {
  return (
    <div className="floating-letters" aria-hidden="true">
      {['A', 'B', 'C', '∑', 'π', '∞'].map((letter, index) => (
        <span key={`${letter}-${index}`} style={{ '--i': index }}>{letter}</span>
      ))}
    </div>
  );
}
