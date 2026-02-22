import punchline_logo from '../../../assets/punchline.png';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      alt="Punchline Pro logo"
      className={className ?? 'brand-logo-image'}
      src={punchline_logo}
    />
  );
}
