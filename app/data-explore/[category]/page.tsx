import DataCategoryContent from './DataCategoryContent';
import { CATEGORIES } from '@/app/data/dataExplore';

// Required for static export: pre-render all known category slugs
export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export default function DataCategoryPage({ params }: { params: { category: string } }) {
  return <DataCategoryContent params={params} />;
}
