import CompanyRankingTable from './CompanyRankingTable';

interface NewsTag {
  symbol: string;
  name: string;
}

interface NewsItemWithTags {
  tags: NewsTag[];
}

interface NewsInsightsProps {
  newsItems: NewsItemWithTags[];
}

export default function NewsInsights({ newsItems }: NewsInsightsProps) {
  return (
    <div className="news-insights-segment">
      <CompanyRankingTable newsItems={newsItems} />
    </div>
  );
}
