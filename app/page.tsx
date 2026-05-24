import dynamic from 'next/dynamic';

const SpendApp = dynamic(() => import('../components/SpendApp'), { ssr: false });

export default function Page() {
  return <SpendApp />;
}
