import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-8 w-8 text-primary"
      >
        <path d="M14.2 19.4c-3.5 2.1-8.5 2-11.7-1.2s-4.8-8.2-2.7-11.7 8.2-4.8 11.7-2.7a8.5 8.5 0 0 1 4.5 4.5" />
        <path d="M22 2 15 9l-4.3-4.3L2 13.3" />
        <path d="m3 7 1.5-1.5" />
        <path d="m6.5 3.5 1-1" />
        <path d="m11 2 1 1" />
      </svg>
      <span className="text-2xl font-bold text-primary">UTSARG</span>
    </Link>
  );
}
